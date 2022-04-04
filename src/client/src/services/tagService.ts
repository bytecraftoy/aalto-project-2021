import axios from 'axios';
import { axiosWrapper } from './axiosWrapper';
import { ITag, ITaggedNode } from '../../../../types';
export const baseUrl = '/api/tag';
import { getAuthConfig } from './userService';

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

const addNodeTagName = async (projId: number, nodeId: number, tagName: string): Promise<ITag | undefined> => {
    const response: ITag | undefined = await axiosWrapper(
        axios.post<ITag>(
            `${baseUrl}/node/tagname`,
            {
                projId: projId,
                nodeId: nodeId,
                tagName: tagName,
            },
            getAuthConfig()
        )
    );
    return response;
}

const addNodeTagId = async (projId: number, nodeId: number, tagId: number): Promise<ITaggedNode | undefined> => {
    const response: ITaggedNode | undefined = await axiosWrapper(
        axios.post<ITaggedNode>(
            `${baseUrl}/node/tagid`,
            {
                projId: projId,
                nodeId: nodeId,
                tagId: tagId,
            },
            getAuthConfig()
        )
    );
    return response;
}

export { getAll, getAllForProj, sendTag, deleteTag, updateTag, addNodeTagName, addNodeTagId };
