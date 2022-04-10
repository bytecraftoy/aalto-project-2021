import axios from 'axios';
import { IProject, ProjectPermissions, UserData } from '../../../../types';
import { axiosWrapper } from './axiosWrapper';
import { getAuthConfig } from './userService';
export const baseUrl = '/api/project';

const getAll = async (): Promise<IProject[]> => {
    const project = await axiosWrapper(
        axios.get<IProject[]>(baseUrl, getAuthConfig())
    );
    return project || [];
};

const getProject = async (projectId: number): Promise<IProject | undefined> => {
    const project = await axiosWrapper(
        axios.get<IProject>(`${baseUrl}/${projectId}`, getAuthConfig())
    );
    return project;
};

const getProjectPermissions = async (
    projectId: number
): Promise<ProjectPermissions> => {
    const project = await axiosWrapper(
        axios.get<ProjectPermissions>(
            `${baseUrl}/${projectId}/permission`,
            getAuthConfig()
        )
    );
    return project || { view: false, edit: false };
};

const sendProject = async (project: IProject): Promise<number | undefined> => {
    const response = await axiosWrapper(
        axios.post<{ id: number }>(baseUrl, project, getAuthConfig())
    );
    return response?.id;
};

const deleteProject = async (projectId: number): Promise<void> => {
    return await axiosWrapper(
        axios.delete(`${baseUrl}/${projectId}`, getAuthConfig())
    );
};
const updateProject = async (project: IProject): Promise<void> => {
    return await axiosWrapper(axios.put(baseUrl, project, getAuthConfig()));
};

const getMembers = async (projectId: number): Promise<UserData[]> => {
    return (
        (await axiosWrapper(
            axios.get<UserData[]>(
                `${baseUrl}/${projectId}/members`,
                getAuthConfig()
            )
        )) || []
    );
};

const addMember = async (
    projectId: number,
    member: string
): Promise<UserData | undefined> => {
    return await axiosWrapper(
        axios.post<UserData>(
            `${baseUrl}/${projectId}/members`,
            { member },
            getAuthConfig()
        )
    );
};

const deleteMember = async (
    projectId: number,
    userId: number
): Promise<void> => {
    return await axiosWrapper(
        axios.delete(
            `${baseUrl}/${projectId}/members/${userId}`,
            getAuthConfig()
        )
    );
};

export {
    getAll,
    getProject,
    getProjectPermissions,
    sendProject,
    deleteProject,
    updateProject,
    getMembers,
    addMember,
    deleteMember,
};
