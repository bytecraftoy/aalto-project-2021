import { beforeEach, expect, test, describe, beforeAll } from '@jest/globals';
import { db } from '../dbConfigs';
import { IEdge, User } from '../../../types';
import supertest from 'supertest';
import { app } from '../index';
import {
    addDummyNodes,
    addDummyProject,
    registerRandomUser,
} from './testHelper';
import { mockUser } from '../../../testmock';

const baseUrl = '/api/edge';

const api = supertest(app);

//This holds the possible dummy node's ID's

//Helper functions for the tests
let pId: number;
let user: User = mockUser;

//Helper functions end here

describe('Edge', () => {
    beforeAll(async () => {
        await db.initDatabase();
        const login = await registerRandomUser(api);
        user = login.user;
    });

    beforeEach(async () => {
        pId = await addDummyProject(db, user.id);
    });

    describe('GET request', () => {
        test('should give an empty array if there are no edges', async () => {
            const res = await api.get(`${baseUrl}/${pId}`).expect(200);
            expect(res.body).toHaveLength(0);
        });

        test('should give an edge if there is one', async () => {
            const ids = await addDummyNodes(db, pId);

            await db.query(
                'INSERT INTO edge (source_id, target_id, project_id) VALUES ($1, $2, $3)',
                [ids[0], ids[1], pId]
            );
            const res = await api.get(`${baseUrl}/${pId}`).expect(200);
            expect(res.body).toHaveLength(1);
            const e: IEdge = res.body[0];
            expect(e.source_id).toBe(ids[0]);
            expect(e.target_id).toBe(ids[1]);
            expect(e.project_id).toBe(pId);
        });
    });

    describe('POST request', () => {
        test('should successfully send an edge', async () => {
            const ids = await addDummyNodes(db, pId);
            const e: IEdge = {
                source_id: ids[0],
                target_id: ids[1],
                project_id: pId,
            };

            await api.post(baseUrl).send(e).expect(200);
        });

        test('should save the edge appropriately', async () => {
            const ids = await addDummyNodes(db, pId);

            const e: IEdge = {
                source_id: ids[0],
                target_id: ids[1],
                project_id: pId,
            };

            await api.post(baseUrl).send(e).expect(200);

            const res = await api.get(`${baseUrl}/${pId}`).expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].source_id).toBe(ids[0]);
            expect(res.body[0].target_id).toBe(ids[1]);
            expect(res.body[0].project_id).toBe(pId);
        });

        test('should not allow duplicate edges', async () => {
            const ids = await addDummyNodes(db, pId);

            const e: IEdge = {
                source_id: ids[0],
                target_id: ids[1],
                project_id: pId,
            };

            await api.post(baseUrl).send(e).expect(200);

            await api.post(baseUrl).send(e).expect(403);
        });

        test('should switch source and target when trying to make both-way edges', async () => {
            const ids = await addDummyNodes(db, pId);

            const e1: IEdge = {
                source_id: ids[0],
                target_id: ids[1],
                project_id: pId,
            };
            const e2: IEdge = {
                source_id: ids[1],
                target_id: ids[0],
                project_id: pId,
            };

            await api.post(baseUrl).send(e1).expect(200);
            await api.post(baseUrl).send(e2).expect(200);

            const res = await api.get(`${baseUrl}/${pId}`).expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].source_id).toBe(ids[1]);
            expect(res.body[0].target_id).toBe(ids[0]);
        });

        test('should not allow an target and source nodes to be the same', async () => {
            const ids = await addDummyNodes(db, pId);

            const e1: IEdge = {
                source_id: ids[0],
                target_id: ids[0],
                project_id: pId,
            };

            const res = await api.post(baseUrl).send(e1).expect(400);
            expect(res.body.message).toBe('Source and target were the same');
        });
    });

    describe('DELETE request', () => {
        test('should delete a single edge', async () => {
            const ids = await addDummyNodes(db, pId);

            const e: IEdge = {
                source_id: ids[0],
                target_id: ids[1],
                project_id: pId,
            };

            await api.post(baseUrl).send(e).expect(200);

            let res = await api.get(`${baseUrl}/${pId}`).expect(200);
            expect(res.body).toHaveLength(1);

            await api
                .delete(
                    `${baseUrl}/${res.body[0].source_id}/${res.body[0].target_id}`
                )
                .expect(200);

            res = await api.get(`${baseUrl}/${pId}`).expect(200);

            expect(res.body).toHaveLength(0);
        });

        test('should not crash the app if the id does not exist', async () => {
            const e: IEdge = {
                source_id: 0,
                target_id: 0,
                project_id: pId,
            };
            await api
                .delete(`${baseUrl}/${e.source_id}/${e.target_id}`)
                .expect(403);
        });
    });
});
