import { router } from '../router';
import { Request, Response } from 'express';
import { db } from '../../dbConfigs';
import { Login, Registration } from '../../../../types';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

router.route('/user/register').post(async (req: Request, res: Response) => {
    const user: Registration = req.body;

    if (!user || !user.username || !user.password || !user.email) {
        res.status(403).json({ message: 'Missing parameters' });
        return;
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(user.password, saltRounds);
    const q = await db.query(
        'INSERT INTO users (username, password, email) VALUES (LOWER($1), $2, LOWER($3)) ON CONFLICT DO NOTHING RETURING (id)',
        [user.username, hash, user.email]
    );
    if (q.rowCount > 0) {
        res.status(200).json().end();
    } else {
        res.status(403)
            .json({
                message: 'Username or email already registered',
            })
            .end();
    }
});

router.route('/user/login').post(async (req: Request, res: Response) => {
    const body: Login = req.body;
    let user = null;

    if (!body.password || (!body.email && !body.username)) {
        res.status(403).json({ message: 'Missing parameters' }).end();
        return;
    }

    //User tries to login with email
    if (body.email && body.email.includes('@')) {
        const { rows, rowCount } = await db.query(
            'SELECT * FROM users WHERE email=$1',
            [body.email]
        );

        if (rowCount == 0) {
            res.status(401).json({ message: 'Wrong email or password' }).end();
            return;
        } else if (rowCount >= 2) {
            res.status(500).json({ message: 'More than one user found' }).end();
            return;
        }

        user = rows[0];
    }

    //User tries to login with a username
    if (body.username) {
        const { rows, rowCount } = await db.query(
            'SELECT * FROM users WHERE username=$1',
            [body.username]
        );

        if (rowCount == 0) {
            res.status(401)
                .json({ message: 'Wrong username or password' })
                .end();
            return;
        }

        user = rows[0];
    }

    const passCorrect = await bcrypt.compare(body.password, user.password);

    if (!passCorrect) {
        res.status(401).json({ message: 'Wrong email or password' });
        return;
    }

    // Cannot give a type. Might have to do some validation
    const userForToken = {
        email: user.email,
        id: user.id,
    };

    const token = jwt.sign(
        userForToken,
        process.env.SECRET ? process.env.SECRET : 'secret'
    );

    res.status(200).json({
        token,
        username: user.username,
        email: user.email,
        id: user.id,
    });
});

export { router as user };
