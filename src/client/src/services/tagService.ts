import axios from 'axios';
import { ITag } from '../../../../types';
// import { ITag, ITaggedNode } from '../../../../types';
export const baseUrl = '/api/tag';

const getAll = async (): Promise<ITag[]> => {
    const tag = await axios.get<ITag[]>(baseUrl);
    return tag.data;
};

const getAllForProj = async (projId: number): Promise<ITag[]> => {
    const tag = await axios.get<ITag[]>(baseUrl + `/proj/${projId}`);
    return tag.data;
};

const sendTag = async (tag: ITag): Promise<number> => {
    const response = await axios.post(baseUrl, tag);
    return response.data.rows[0].id;
};

const deleteTag = async (tag: ITag): Promise<{ msg: string }> => {
    const response = await axios.delete(baseUrl, { data: tag });
    return response.data;
};
const updateTag = async (tag: ITag): Promise<void> => {
    const response = await axios.put(baseUrl, tag);
    return response.data;
};

export { getAll, getAllForProj, sendTag, deleteTag, updateTag };
