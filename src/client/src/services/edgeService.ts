import axios from 'axios';
import { IEdge } from '../../../../types';
import { axiosWrapper } from './axiosWrapper';
export const baseUrl = '/api/edge';

const getAll = async (project_id: number): Promise<IEdge[]> => {
    return (
        (await axiosWrapper(axios.get<IEdge[]>(`${baseUrl}/${project_id}`))) ||
        []
    );
};

const sendEdge = async (edge: IEdge): Promise<boolean> => {
    return (await axiosWrapper(axios.post(baseUrl, edge))) !== undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteEdge = async (source: number, target: number): Promise<void> => {
    await axiosWrapper(axios.delete(`${baseUrl}/${source}/${target}`));
};

export { getAll, sendEdge, deleteEdge };
