import { router } from '../router';
import { Request, Response } from 'express';
import { db } from '../../dbConfigs';
import { Login, Registration, UserToken } from '../../../../../types';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * POST /api/user/register
 * @summary Create a user
 * @description Register a new user in the application. Emails and Usernames are unique. In addition usernames are not case sensitive
 * @response 200 - OK
 * @response 403 - Forbidden
 * @bodyRequired
 * @bodyContent {Register} - application/json
 */
router.route('/user/register').post(async (req: Request, res: Response) => {
    const user: Registration = req.body;

    if (!user || !user.username || !user.password || !user.email) {
        req.logger.info({
            message: 'Missing parameters',
            body: JSON.stringify(user)
        });
        res.status(403).json({ message: 'Missing parameters' });
        return;
    }

    if (user.password.length < 12) {
        req.logger.info({
            message: 'Too small pw',
            body: JSON.stringify(user)
        });
        res.status(403)
            .json({
                message: 'Password must be at least 12 characters long',
            })
            .end();
        return;
    }

    const saltRounds = 5;
    const hash = await bcrypt.hash(user.password, saltRounds);

    req.logger.info({
        message: 'Creating user',
        username: user.username,
    });

    const q = await db.query(
        'INSERT INTO users (username, password, email) VALUES (LOWER($1), $2, LOWER($3)) ON CONFLICT DO NOTHING RETURNING (id)',
        [user.username, hash, user.email]
    );
    if (q.rowCount > 0) {
        res.status(200).json().end();
    } else {
        req.logger.info({
            message: 'Rowcount 0',
        });
        res.status(403)
            .json({
                message: 'Username or email already registered',
            })
            .end();
    }
});

/**
 * POST /api/user/login
 * @summary Login to the application
 * @description Given correct credentials server sends back a json web token which is then used to authenticate the user.
 * @bodyContent {Login} - application/json
 * @bodyRequired
 * @response 200 - OK
 * @response 401 - Unauthorized
 * @response 403 - Forbidden
 */
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

    req.logger.info({
        message: 'Logging in user',
        userId: user.id,
    });

    res.status(200).json({
        token,
        username: user.username,
        email: user.email,
        id: user.id,
    });
});

/**
 * POST /api/user/validity
 * @summary Check JSON web tokens validity
 * @description Endpoint used to check whether the JSON web token on the clients side is still valid.
 * @bodyRequired
 * @bodyContent {Token} - application/jsonn
 * @response 200 - OK
 */
router.route('/user/validity').post(async (req: Request, res: Response) => {
    const body: UserToken = req.body;
    let valid = false;

    const q = await db.query('SELECT * FROM users WHERE username=$1', [
        body.username,
    ]);
    if (q.rowCount == 1) {
        valid = true;
    }

    res.status(200).json({ valid }).end();
});

export { router as user };
