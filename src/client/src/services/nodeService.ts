import axios from 'axios';
import { INode } from '../../../../types';
import { axiosWrapper } from './axiosWrapper';
import { getAuthConfig } from './userService';
export const baseUrl = '/api/node';

const getAll = async (project_id: number): Promise<INode[]> => {
    return (
        (await axiosWrapper(
            axios.get<INode[]>(`${baseUrl}/${project_id}`, getAuthConfig())
        )) || []
    );
};

const sendNode = async (node: INode): Promise<number | undefined> => {
    return (
        (await axiosWrapper(
            axios.post<{ id: number }>(baseUrl, node, getAuthConfig())
        )) || {
            id: undefined,
        }
    ).id;
};

const deleteNode = async (id: number): Promise<void> => {
    await axiosWrapper(axios.delete(`${baseUrl}/${id}`, getAuthConfig()));
};

const updateNode = async (node: INode): Promise<void> => {
    await axiosWrapper(axios.put(baseUrl, node, getAuthConfig()));
};

const updateNodes = async (nodes: INode[]): Promise<void> => {
    await axiosWrapper(axios.put(baseUrl, nodes, getAuthConfig()));
};

export { getAll, sendNode, deleteNode, updateNode, updateNodes };
