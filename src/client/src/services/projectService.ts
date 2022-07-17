import axios from 'axios';
import {
    IProject,
    NodeType,
    NoPermission,
    ProjectPermissions,
    UserData,
} from '../../../../types';
import { axiosWrapper } from './axiosWrapper';
import { getAuthConfig } from './userService';
export const baseUrl = '/api/project';

export const getAll = async (): Promise<IProject[]> => {
    const project = await axiosWrapper(
        axios.get<IProject[]>(baseUrl, getAuthConfig())
    );
    return project || [];
};

export const getProject = async (
    projectId: number
): Promise<IProject | undefined> => {
    const project = await axiosWrapper(
        axios.get<IProject>(`${baseUrl}/${projectId}`, getAuthConfig())
    );
    return project;
};

export const getProjectPermissions = async (
    projectId: number
): Promise<ProjectPermissions | NoPermission> => {
    const project = await axiosWrapper(
        axios.get<ProjectPermissions | NoPermission>(
            `${baseUrl}/${projectId}/permission`,
            getAuthConfig()
        )
    );
    return project || { view: false, edit: false, projectId: undefined };
};

export const sendProject = async (
    project: IProject
): Promise<number | undefined> => {
    const response = await axiosWrapper(
        axios.post<{ id: number }>(baseUrl, project, getAuthConfig())
    );
    return response?.id;
};

export const deleteProject = async (projectId: number): Promise<void> => {
    return await axiosWrapper(
        axios.delete(`${baseUrl}/${projectId}`, getAuthConfig())
    );
};
export const updateProject = async (project: IProject): Promise<void> => {
    return await axiosWrapper(axios.put(baseUrl, project, getAuthConfig()));
};

export const getMembers = async (projectId: number): Promise<UserData[]> => {
    return (
        (await axiosWrapper(
            axios.get<UserData[]>(
                `${baseUrl}/${projectId}/members`,
                getAuthConfig()
            )
        )) || []
    );
};

export const addMember = async (
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

export const deleteMember = async (
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

export const getNodeTypes = async (projectId: number): Promise<NodeType[]> => {
    return (
        (await axiosWrapper(
            axios.get<NodeType[]>(
                `${baseUrl}/${projectId}/type`,
                getAuthConfig()
            )
        )) || []
    );
};

export const addNodeType = async (
    projectId: number,
    ty: NodeType
): Promise<NodeType | undefined> => {
    const id = (
        await axiosWrapper(
            axios.post<NodeType>(
                `${baseUrl}/${projectId}/type`,
                ty,
                getAuthConfig()
            )
        )
    )?.id;
    return id ? { ...ty, id } : undefined;
};
