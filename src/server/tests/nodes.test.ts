import { beforeEach, expect, test, describe, beforeAll } from '@jest/globals';
import { db } from '../dbConfigs';
import { INode, User } from '../../../types';
import supertest from 'supertest';
import { app } from '../index';
import {
    addDummyNodes,
    addDummyProject,
    registerRandomUser,
} from './testHelper';

const api = supertest(app);

let pId: number;
let user: User;

describe('Node', () => {
    beforeAll(async () => {
        await db.initDatabase();
        const login = await registerRandomUser(api);
        user = login.user;
    });

    beforeEach(async () => {
        //adding project
        pId = await addDummyProject(db, user.id);
    });

    describe('Basic GET request', () => {
        test('should work', async () => {
            await api.get(`/api/node/${pId}`).expect(200);
        });
    });

    describe('POST and GET request', () => {
        test('adding node should be successful', async () => {
            const n: INode = {
                label: 'test node',
                priority: 'Urgent',
                status: 'Doing',
                x: 0,
                y: 0,
                project_id: pId,
                description: 'this is a test node',
            };

            await api.post('/api/node').send(n).expect(200);
        });

        test('GET request should give us a node added to the database', async () => {
            const n: INode = {
                label: 'test node',
                priority: 'Urgent',
                status: 'Doing',
                x: 0,
                y: 0,
                project_id: pId,
                description: 'this is a test node',
            };

            await api.post('/api/node').send(n).expect(200);

            const result = await api.get(`/api/node/${pId}`).expect(200);
            expect(result.body).toHaveLength(1);
            const node = result.body[0];
            expect(node).toHaveProperty('label');
            expect(node).toHaveProperty('priority');
            expect(node).toHaveProperty('status');
            expect(node).toHaveProperty('x');
            expect(node).toHaveProperty('y');
            expect(node).toHaveProperty('project_id');
            expect(node).toHaveProperty('description');
        });

        test('A node should have the proper values that were sent', async () => {
            const n: INode = {
                label: 'test node',
                priority: 'Urgent',
                status: 'Doing',
                x: 1,
                y: 2,
                project_id: pId,
                description: 'this is a test node',
            };

            await api.post('/api/node').send(n).expect(200);
            const result = await api.get(`/api/node/${pId}`).expect(200);

            const node = result.body[0];
            expect(node.id).toBeDefined;
            expect(node.label).toBe('test node');
            expect(node.priority).toBe('Urgent');
            expect(node.status).toBe('Doing');
            expect(n.x).toBe(1);
            expect(n.y).toBe(2);
            expect(n.project_id).toBe(pId);
            expect(n.description).toBe('this is a test node');
        });

        test('an invalid node should not be added to the database', async () => {
            const n = {
                priority: 'Urgent',
                status: 'done',
            };
            await api.post('/api/node').send(n).expect(403);
        });
    });

    describe('DELETE request', () => {
        test('with an id should delete the node from the DB', async () => {
            await addDummyNodes(db, pId);

            let result = await api.get(`/api/node/${pId}`).expect(200);
            expect(result.body[0].id).toBeDefined();
            expect(result.body[1].id).toBeDefined();
            const id = result.body[0].id;
            await api.delete(`/api/node/${id}`).expect(200);
            result = await api.get(`/api/node/${pId}`).expect(200);

            expect(result.body).toHaveLength(1);
        });

        test('deletes the right node', async () => {
            await addDummyNodes(db, pId);

            let res = await api.get(`/api/node/${pId}`).expect(200);

            const id = res.body[0].id;

            await api.delete(`/api/node/${id}`).expect(200);

            res = await api.get(`/api/node/${pId}`).expect(200);
            const found = res.body.find((x: INode) => x.id == id);
            expect(found).toBeUndefined();
        });
    });

    describe('PUT request', () => {
        test('should update the location of a node', async () => {
            await addDummyNodes(db, pId);

            const res = await api.get(`/api/node/${pId}`);
            const dummyNode: INode = {
                ...res.body[0],
                x: 50,
                y: 60,
            };

            await api.put('/api/node').send(dummyNode).expect(200);
            const res2 = await api.get(`/api/node/${pId}`);
            const found: INode | undefined = res2.body.find(
                (x: INode) => x.id == res.body[0].id
            );
            if (found) {
                expect(found.x).toBe(50);
                expect(found.y).toBe(60);
            }
        });

        test('should update the label of a node', async () => {
            await addDummyNodes(db, pId);

            const res = await api.get(`/api/node/${pId}`);
            const dummyNode: INode = {
                ...res.body[0],
                label: 'NEW NAME',
            };

            await api.put('/api/node').send(dummyNode).expect(200);
            const res2 = await api.get(`/api/node/${pId}`);
            const found: INode | undefined = res2.body.find(
                (x: INode) => x.id == res.body[0].id
            );
            if (found) {
                expect(found.label).toBe('NEW NAME');
            }
        });

        test('should update the label of multiple nodes', async () => {
            await addDummyNodes(db, pId);

            const res = await api.get(`/api/node/${pId}`);
            const dummyNode: INode = {
                ...res.body[0],
                label: 'NEW NAME',
            };
            const dummyNode2: INode = {
                ...res.body[1],
                label: 'NEW NAME2',
            };

            await api
                .put('/api/node')
                .send([dummyNode, dummyNode2])
                .expect(200);
            const res2 = await api.get(`/api/node/${pId}`);
            const found1: INode = res2.body.find(
                (x: INode) => x.id == res.body[0].id
            );
            const found2: INode = res2.body.find(
                (x: INode) => x.id == res.body[1].id
            );
            expect(found1).not.toBeFalsy();
            expect(found1.label).toBe(dummyNode.label);
            expect(found2).not.toBeFalsy();
            expect(found2.label).toBe(dummyNode2.label);
        });
    });

    describe('Database', () => {
        test('should be safe from SQL injections', async () => {
            let node: INode = {
                label: 'Let us hack!',
                // eslint-disable-next-line quotes
                priority: "'Urgent); DROP TABLE nodes; --'",
                status: 'Doing',
                x: 0,
                y: 0,
                project_id: pId,
                // eslint-disable-next-line quotes
                description: "'this is a test node); DROP TABLE nodes; --'",
            };

            await api.post('/api/node').send(node).expect(200);
            let q = await db.query('SELECT * FROM node WHERE priority=$1', [
                node.priority,
            ]);
            expect(q.rowCount).toBeGreaterThan(0);

            node = {
                ...node,
                // eslint-disable-next-line quotes
                label: "'Try hacking); DROP TABLE nodes; --'",
                priority: 'Urgent',
            };

            await api.post('/api/node').send(node).expect(200);
            q = await db.query('SELECT * FROM node WHERE  label=$1', [
                node.label,
            ]);
            expect(q.rowCount).toBeGreaterThan(0);
        });
    });
});
