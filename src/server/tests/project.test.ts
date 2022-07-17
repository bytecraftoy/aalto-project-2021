import { beforeEach, expect, test, describe } from '@jest/globals';
import { db } from '../src/dbConfigs';
import { INode, IProject, User } from '../../../types';
import supertest from 'supertest';
import { app } from '../src/index';
import {
    addProject,
    registerLoginUser,
    registerRandomUser,
} from './testHelper';

const baseUrl = '/api/project';

const api = supertest(app);

//This holds the possible dummy project's ID's
let ids: number[] = [];
let user: User;
let token: string;

//Helper functions for the tests
const addDummyProjects = async (): Promise<void> => {
    const p1: IProject = {
        name: 'Test-1',
        description: 'First-project',
        owner_id: user.id,
        id: 0,
        public_view: true,
        public_edit: true,
    };

    const p2: IProject = {
        name: 'Test-2',
        description: 'Second-project',
        owner_id: user.id,
        id: 0,
        public_view: true,
        public_edit: true,
    };

    ids = [];
    ids.push(await addProject(db, p1));
    ids.push(await addProject(db, p2));
};

//Helper functions end here
describe('Projects', () => {
    beforeEach(async () => {
        await db.clean('Project tests: ' + expect.getState().currentTestName);
        const login = await registerRandomUser(api);
        user = login.user;
        token = login.token;
    });

    describe('GET request', () => {
        test('should give an empty array if there are no projects', async () => {
            const res = await api
                .get(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);
            expect(res.body).toHaveLength(0);
        });
    });

    describe('POST request', () => {
        test('should successfully send a project', async () => {
            const p: IProject = {
                name: 'Test-1',
                description: 'First-project',
                owner_id: user.id,
                id: 0,
                public_view: true,
                public_edit: true,
            };

            await api
                .post(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .send(p)
                .expect(200);

            const res = await api
                .get(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);
            expect(res.body).toHaveLength(1);
            const project = res.body[0];
            expect(project.name).toBe('Test-1');
            expect(project.description).toBe('First-project');
            expect(project.owner_id).toBe(user.id);
        });

        test('an invalid project should not be added to the database', async () => {
            const p = {
                name: 'Failing-test',
                description: 'This should fail',
            };
            await api
                .post(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .send(p)
                .expect(401);
        });
    });

    describe('DELETE request', () => {
        test('with an id should delete the project from the DB', async () => {
            await addDummyProjects();

            let result = await api
                .get(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);

            const lenghtBeforeDelete = result.body.length;

            expect(result.body[0].id).toBeDefined();
            expect(result.body[1].id).toBeDefined();
            const id = result.body[0].id;
            await api
                .delete(`${baseUrl}/${id}`)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);
            result = await api
                .get(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);
            expect(result.body).toHaveLength(lenghtBeforeDelete - 1);
        });

        test('deletes the right project', async () => {
            await addDummyProjects();

            let res = await api
                .get(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);

            const id = res.body[0].id;

            await api
                .delete(`${baseUrl}/${id}`)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);

            res = await api
                .get(baseUrl)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);
            const found = res.body.find((x: IProject) => x.id == id);
            expect(found).toBeUndefined();
        });

        test('should not crash the app if the project to be deleted does not exist', async () => {
            const p: IProject = {
                name: 'Not-exiting',
                description: 'Not-existing-project',
                owner_id: 0,
                id: 0,
                public_view: true,
                public_edit: true,
            };
            await api
                .delete(`${baseUrl}/${p.id}`)
                .set('Authorization', `bearer ${token}`)
                .expect(401);
        });
    });

    describe('Test project permissions', () => {
        let onlyViewId: number;
        let noViewId: number;
        let anotherToken: string;
        const anotherUser: User = {
            username: 'John',
            password: 'DoePersonHere',
            email: 'john_doe@example.com',
            id: 0,
        };

        beforeEach(async () => {
            const anotherUserAuth = await registerLoginUser(api, anotherUser);
            anotherUser.id = anotherUserAuth.id;
            anotherToken = anotherUserAuth.token;

            const p1: IProject = {
                name: 'onlyView',
                description: 'Only viewing no editing',
                owner_id: user.id,
                id: 0,
                public_view: true,
                public_edit: false,
            };

            const p2: IProject = {
                name: 'noView',
                description: 'No viewing no editing',
                owner_id: user.id,
                id: 0,
                public_view: false,
                public_edit: false,
            };

            onlyViewId = await addProject(db, p1);
            noViewId = await addProject(db, p2);
        });

        test('should return 200 on get if public_view is true on an anonymous account', async () => {
            await api.get(`${baseUrl}/${onlyViewId}`).expect(200);
        });

        test('should return 401 on get if public_view is false on an anonymous account', async () => {
            await api.get(`${baseUrl}/${noViewId}`).expect(401);
        });

        test('should return 401 on post if public_edit is false on an anonymous account', async () => {
            const n: INode = {
                label: 'ShouldntBePosted',
                priority: 'Urgent',
                status: 'Doing',
                x: 0,
                y: 0,
                project_id: onlyViewId,
                description: 'this should not be posted',
                node_type: undefined,
            };

            await api.post('/api/node').send(n).expect(401);
        });

        test('should be able to add and remove an account to a project', async () => {
            await api
                .get(`${baseUrl}/${noViewId}`)
                .set('X-Depsee-Auth', `bearer ${anotherToken}`)
                .expect(401);

            await api
                .post(`${baseUrl}/${noViewId}/members`)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .send({ member: anotherUser.email })
                .expect(200);

            await api
                .get(`${baseUrl}/${noViewId}`)
                .set('X-Depsee-Auth', `bearer ${anotherToken}`)
                .expect(200);

            await api
                .delete(`${baseUrl}/${noViewId}/members/${anotherUser.id}`)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .expect(200);

            await api
                .get(`${baseUrl}/${noViewId}`)
                .set('X-Depsee-Auth', `bearer ${anotherToken}`)
                .expect(401);
        });

        test('should be able to post in project if account is invited', async () => {
            const n: INode = {
                label: 'ShouldBePosted',
                priority: 'Urgent',
                status: 'Doing',
                x: 0,
                y: 0,
                project_id: noViewId,
                description: 'this should be posted',
                node_type: undefined,
            };

            await api
                .post('/api/node')
                .set('X-Depsee-Auth', `bearer ${anotherToken}`)
                .send(n)
                .expect(401);

            await api
                .post(`${baseUrl}/${noViewId}/members`)
                .set('X-Depsee-Auth', `bearer ${token}`)
                .send({ member: anotherUser.email })
                .expect(200);

            await api
                .post('/api/node')
                .set('X-Depsee-Auth', `bearer ${anotherToken}`)
                .send(n)
                .expect(200);
        });
    });
});
