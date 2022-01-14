import axios from 'axios';
import { Edge } from 'react-flow-renderer';
import { IEdge } from '../../../../types';
export const baseUrl = '/api/edge';

const getAll = async (): Promise<IEdge[]> => {
    const response = await axios.get<IEdge[]>(baseUrl);
    console.log(response.data);
    return response.data;
};

const sendEdge = async (edge: IEdge): Promise<{ msg: string }> => {
    const response = await axios.post(baseUrl, edge);
    console.log('Edge added', response.data);
    return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteEdge = async (edge: Edge<any>): Promise<void> => {
    const response = await axios.delete(
        `${baseUrl}/${edge.source}/${edge.target}`
    );
    if (response.status !== 200) {
        console.log(`Removing Edge ${edge} failed`);
    } else {
        console.log('Edge removed', edge);
    }
};

export { getAll, sendEdge, deleteEdge };
