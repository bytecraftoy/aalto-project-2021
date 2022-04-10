import axios from 'axios';
import { UserData } from '../../../../types';
import { axiosWrapper } from './axiosWrapper';
import { getAuthConfig } from './userService';
export const baseUrl = '/api/assignment';

export const assignUser = async (
    nodeId: number,
    userId: number
): Promise<void> => {
    await axiosWrapper(
        axios.post(
            `${baseUrl}/assign/${nodeId}/${userId}`,
            {},
            getAuthConfig()
        ),
        'user assignment'
    );
};

export const unassignUser = async (
    nodeId: number,
    userId: number
): Promise<void> => {
    await axiosWrapper(
        axios.delete(`${baseUrl}/assign/${nodeId}/${userId}`, getAuthConfig()),
        'user unassignment'
    );
};

export const getAssignedUsers = async (nodeId: number): Promise<UserData[]> => {
    return (
        (await axiosWrapper(
            axios.get<UserData[]>(`${baseUrl}/${nodeId}`, getAuthConfig()),
            'getting assigned users'
        )) || []
    );
};
