import { beforeEach, expect, test, describe } from '@jest/globals';
import { db } from '../src/dbConfigs';
import supertest from 'supertest';
import { app } from '../src/index';
import bcrypt from 'bcrypt';
import { Registration } from '../../../types';
import { logger } from '../src/helper/logging';

const api = supertest(app);
const baseUrl = '/api/user';

const dummyUsers: Registration[] = [
    {
        username: 'Mr_Test1',
        password: 'My_Secret_password',
        email: 'mrtest@example.com',
    },
    {
        username: 'Jane_Doe',
        password: 'SweetKitties65#',
        email: 'jane.doe100@example.com',
    },
];

const addDummyUsers = async () => {
    let user = dummyUsers[0];

    await api.post(`${baseUrl}/register`).send(user);

    user = dummyUsers[1];

    await api.post(`${baseUrl}/register`).send(user);
};

describe('User registration', () => {
    beforeEach(async () => {
        await db.clean('User tests: ' + expect.getState().currentTestName);
    });

    test('sending a POST request with appropriate information should add a user', async () => {
        const person = {
            username: 'Tommy',
            password: 'FlyingCows123',
            email: 'tommy@example.com',
        };

        await api.post(`${baseUrl}/register`).send(person).expect(200);
    });

    test('POST requests with missing values should not add users', async () => {
        //Missing password
        const person1 = {
            username: 'Tommy',
            email: 'tommy@example.com',
        };

        let res = await api
            .post(`${baseUrl}/register`)
            .send(person1)
            .expect(403);
        expect(res.body.message).toBe('Missing parameters');

        //Missing username
        const person2 = {
            password: 'FlyingCows555',
            email: 'tommy@example.com',
        };

        res = await api.post(`${baseUrl}/register`).send(person2).expect(403);
        expect(res.body.message).toBe('Missing parameters');

        //Missing email
        const person3 = {
            username: 'Tommy',
            password: 'FlyingCows555',
        };

        res = await api.post(`${baseUrl}/register`).send(person3).expect(403);
        expect(res.body.message).toBe('Missing parameters');

        //Send an empty object

        res = await api.post(`${baseUrl}/register`).send({}).expect(403);
        expect(res.body.message).toBe('Missing parameters');
    });

    test('password should be saved in hashes not in plain text', async () => {
        await api.post(`${baseUrl}/register`).send(dummyUsers[0]).expect(200);
        await api.post(`${baseUrl}/register`).send(dummyUsers[1]).expect(200);

        const q = await db.query('SELECT * FROM users;', []);
        const rows = q.rows.map((x) => x.password);
        dummyUsers
            .map((x) => x.password)
            .forEach((password) => {
                expect(rows.includes(password)).toBeFalsy();
            });

        rows.forEach((x) => expect(x).toHaveLength(60));
    });

    test('saved password hashes should be correct', async () => {
        await api.post(`${baseUrl}/register`).send(dummyUsers[0]).expect(200);
        await api.post(`${baseUrl}/register`).send(dummyUsers[1]).expect(200);

        const { rows } = await db.query('SELECT * FROM users;', []);
        for (let i = 0; i < dummyUsers.length; i++) {
            const comparison = await bcrypt.compare(
                dummyUsers[i].password,
                rows[i].password
            );
            expect(comparison).toBeTruthy();
        }
    });

    test('username should be unique', async () => {
        await api.post(`${baseUrl}/register`).send(dummyUsers[0]).expect(200);
        await api
            .post(`${baseUrl}/register`)
            .send({ ...dummyUsers[0], email: 'randomuser@example.com' })
            .expect(403);
    });

    test('username should not be case sensitive', async () => {
        await api.post(`${baseUrl}/register`).send(dummyUsers[0]).expect(200);
        await api.post(`${baseUrl}/register`).send(dummyUsers[1]).expect(200);

        const sensitiveUser1 = dummyUsers[0];
        sensitiveUser1.username = sensitiveUser1.username.toUpperCase();
        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser1 })
            .expect(403);

        sensitiveUser1.username = sensitiveUser1.username.toLowerCase();
        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser1 })
            .expect(403);

        const sensitiveUser2 = dummyUsers[1];
        sensitiveUser2.username = sensitiveUser2.username.toUpperCase();

        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser2 })
            .expect(403);

        sensitiveUser2.username = sensitiveUser2.username.toLowerCase();
        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser2 })
            .expect(403);
    });

    test('email should not be case sensitive', async () => {
        await api.post(`${baseUrl}/register`).send(dummyUsers[0]).expect(200);
        await api.post(`${baseUrl}/register`).send(dummyUsers[1]).expect(200);

        const sensitiveUser1 = {
            ...dummyUsers[0],
            username: dummyUsers[0].username.toUpperCase(),
        };
        const sensitiveUser2 = {
            ...dummyUsers[1],
            username: dummyUsers[1].username.toUpperCase(),
        };

        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser1 })
            .expect(403);

        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser2 })
            .expect(403);

        sensitiveUser1.username = sensitiveUser1.username.toLowerCase();
        sensitiveUser2.username = sensitiveUser2.username.toLowerCase();

        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser1 })
            .expect(403);

        await api
            .post(`${baseUrl}/register`)
            .send({ ...sensitiveUser2 })
            .expect(403);
    });

    test('password should be at least 12 characters long', async () => {
        const user1 = {
            ...dummyUsers[1],
            password: 'pass',
        };

        await api.post(`${baseUrl}/register`).send(user1).expect(403);
    });
});

describe('Logging in', () => {
    test('should work with an email given correct credentials', async () => {
        await addDummyUsers();

        let user = dummyUsers[0];

        //await api.post(`${baseUrl}/register`).send(user)

        let res = await api
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password })
            .expect(200);
        expect(res.body).toHaveProperty('token');

        user = dummyUsers[1];

        res = await api
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password })
            .expect(200);
        expect(res.body).toHaveProperty('token');
    });

    test('should work with a username given correct credentials', async () => {
        await addDummyUsers();

        let user = dummyUsers[0];

        let res = await api
            .post(`${baseUrl}/login`)
            .send({ username: user.username, password: user.password });
        expect(res.body).toHaveProperty('token');

        user = dummyUsers[1];

        res = await api
            .post(`${baseUrl}/login`)
            .send({ username: user.username, password: user.password });
        expect(res.body).toHaveProperty('token');
    });

    test('giving a wrong password should not send a token back', async () => {
        await addDummyUsers();

        let user = dummyUsers[0];
        let res = await api
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: 'LetsHack!123' })
            .expect(401);
        expect(res.body.message).toBe('Wrong email or password');

        user = dummyUsers[1];
        res = await api
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: 'LetsHack!123' })
            .expect(401);
        expect(res.body.message).toBe('Wrong email or password');
    });

    test('giving a wrong email should not send a token back', async () => {
        await addDummyUsers();

        let user = dummyUsers[0];
        let res = await api
            .post(`${baseUrl}/login`)
            .send({ email: 'hack@example.com', password: user.password })
            .expect(401);
        expect(res.body.message).toBe('Wrong email or password');

        user = dummyUsers[1];
        res = await api
            .post(`${baseUrl}/login`)
            .send({ email: 'hack@example.com', password: user.password })
            .expect(401);
        expect(res.body.message).toBe('Wrong email or password');
    });

    test('giving a wrong username should not send a token back', async () => {
        await addDummyUsers();

        let user = dummyUsers[0];
        let res = await api
            .post(`${baseUrl}/login`)
            .send({ username: 'Mr.WrongGuy', password: user.password })
            .expect(401);
        expect(res.body.message).toBe('Wrong username or password');

        user = dummyUsers[1];
        res = await api
            .post(`${baseUrl}/login`)
            .send({ username: 'Ms.WrongGuy', password: user.password })
            .expect(401);
        expect(res.body.message).toBe('Wrong username or password');
    });
});

describe('Database', () => {
    test('should be safe from SQL injections when adding a user', async () => {
        let injection: Registration = {
            // eslint-disable-next-line quotes
            email: " d'); DROP TABLE users; --",
            password: 'Attackersdream',
            username: 'Hacker',
        };

        await api.post(`${baseUrl}/register`).send(injection).expect(200);

        let q = await db.query('SELECT * FROM users WHERE email=$1', [
            injection.email,
        ]);
        expect(q.rowCount).toBeGreaterThan(0);

        injection = {
            // eslint-disable-next-line quotes
            username: " d'); DROP TABLE users; --",
            password: 'Attackersdream',
            email: 'hacker@example.com',
        };

        await api.post(`${baseUrl}/register`).send(injection).expect(200);

        q = await db.query('SELECT * FROM users WHERE username=$1;', [
            injection.username,
        ]);
        expect(q.rowCount).toBeGreaterThan(0);

        injection = {
            // eslint-disable-next-line quotes
            password: " d'); DROP TABLE users; --",
            email: 'hackernot@example.com',
            username: 'Password hacker',
        };

        q = await db.query('SELECT * FROM users;', []);
        expect(q.rowCount).toBeGreaterThan(0);
    });
});
