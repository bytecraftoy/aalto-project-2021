import {
    beforeEach,
    expect,
    test,
    describe,
    beforeAll,
    jest,
} from '@jest/globals';
import { db } from '../dbConfigs';
import { User, UserData } from '../../../types';
import supertest from 'supertest';
import { app } from '../index';
import {
    addDummyNodes,
    addDummyProject,
    registerLoginUser,
} from './testHelper';
import { mockUser } from '../../../testmock';

const api = supertest(app);

let pId: number;
const user: User = mockUser;

jest.setTimeout(10000);

describe('assignment', () => {
    beforeAll(async () => {
        const login = await registerLoginUser(api, user);
        user.id = login.id;
    });

    beforeEach(async () => {
        // DATABASE RESET
        await db.query('DELETE FROM project', []);
        //adding project
        pId = await addDummyProject(db, user.id);
    });

    describe('GET request', () => {
        test('should succeed', async () => {
            const nodeIds = await addDummyNodes(db, pId);
            await api.get(`/api/assignment/${nodeIds[0]}`).expect(200);
        });

        test('should return the correct users', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            db.query(
                'INSERT INTO users__node (users_id, node_id) VALUES ($1, $2)',
                [user.id, nodeIds[0]]
            );

            const result1 = await api
                .get(`/api/assignment/${nodeIds[0]}`)
                .expect(200);
            const result2 = await api
                .get(`/api/assignment/${nodeIds[1]}`)
                .expect(200);

            expect(result1.body).toHaveLength(1);
            expect(result2.body).toHaveLength(0);

            const userData: UserData = result1.body[0];

            expect(userData.id).toBe(user.id);
            expect(userData).toHaveProperty('email');
            expect(userData).toHaveProperty('username');
        });
    });

    describe('POST request', () => {
        test('should assign user correctly', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            await api
                .post(`/api/assignment/assign/${nodeIds[0]}/${user.id}`)
                .expect(200);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(1);
            expect(q.rows[0]).toEqual({
                users_id: user.id,
                node_id: nodeIds[0],
            });
        });

        test('should return 403 and not assign user if node id is invalid', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            await api
                .post(
                    `/api/assignment/assign/${nodeIds[0] + nodeIds[1]}/${
                        user.id
                    }`
                )
                .expect(403);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(0);
        });

        test('should return 403 and not assign user if user id is invalid', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            await api
                .post(`/api/assignment/assign/${nodeIds[0]}/${user.id * 2}`)
                .expect(403);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(0);
        });

        test('should return 403 if trying to assign an already assigned user', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            await api
                .post(`/api/assignment/assign/${nodeIds[0]}/${user.id}`)
                .expect(200);

            await api
                .post(`/api/assignment/assign/${nodeIds[0]}/${user.id}`)
                .expect(403);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(1);
        });
    });

    describe('DELETE request', () => {
        test('should unassign user correctly', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            db.query(
                'INSERT INTO users__node (users_id, node_id) VALUES ($1, $2)',
                [user.id, nodeIds[0]]
            );

            await api
                .delete(`/api/assignment/assign/${nodeIds[0]}/${user.id}`)
                .expect(200);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(0);
        });

        test('should return 403 and not unassign user if node id is invalid', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            db.query(
                'INSERT INTO users__node (users_id, node_id) VALUES ($1, $2)',
                [user.id, nodeIds[0]]
            );

            await api
                .delete(
                    `/api/assignment/assign/${nodeIds[0] + nodeIds[1]}/${
                        user.id
                    }`
                )
                .expect(403);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(1);
        });

        test('should return 403 and not unassign user if user id is invalid', async () => {
            const nodeIds = await addDummyNodes(db, pId);

            db.query(
                'INSERT INTO users__node (users_id, node_id) VALUES ($1, $2)',
                [user.id, nodeIds[0]]
            );

            await api
                .delete(`/api/assignment/assign/${nodeIds[0]}/${user.id * 2}`)
                .expect(403);

            const q = await db.query('SELECT * FROM users__node');

            expect(q.rows).toHaveLength(1);
        });
    });
});
