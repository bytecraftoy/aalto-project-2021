import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UserData } from '../../../../../types';
import {
    assignUser,
    unassignUser,
    getAssignedUsers,
} from '../../services/assignmentService';

describe('assignment service', () => {
    let mockAxios: MockAdapter;

    beforeAll(() => (mockAxios = new MockAdapter(axios)));
    afterEach(() => mockAxios.reset());

    const baseUrl = '/api/assignment';
    const userId = 123;
    const nodeId = 456;

    test('assignUser should make the correct kind of request', async () => {
        mockAxios.onPost(`${baseUrl}/assign/${nodeId}/${userId}`).reply(200);

        await assignUser(nodeId, userId);

        expect(mockAxios.history.post.length).toBe(1);
    });

    test('unassignUser should make the correct kind of request', async () => {
        mockAxios.onDelete(`${baseUrl}/assign/${nodeId}/${userId}`).reply(200);

        await unassignUser(nodeId, userId);

        expect(mockAxios.history.delete.length).toBe(1);
    });

    test('assignUser should make the correct kind of request and return correct data', async () => {
        const testUsers: UserData[] = [
            { id: 1, username: 'a', email: 'a@a.a' },
            { id: 2, username: 'b', email: 'b@b.b' },
        ];

        mockAxios.onGet(`${baseUrl}/${nodeId}`).reply(200, testUsers);

        expect(await getAssignedUsers(nodeId)).toEqual(testUsers);
        expect(mockAxios.history.get.length).toBe(1);
    });
});
