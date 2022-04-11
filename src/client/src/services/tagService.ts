import axios from 'axios';
import { axiosWrapper } from './axiosWrapper';
import { ITag, ITaggedNode } from '../../../../types';
export const baseUrl = '/api/tag';
import { getAuthConfig } from './userService';

const getAllProjTags = async (projId: number): Promise<ITag[]> => {
    const response = await axiosWrapper(
        axios.post<ITag[]>(
            `${baseUrl}/proj`,
            {
                projId: projId,
            },
            getAuthConfig()
        )
    );
    return response || [];
};

const getAllProjTaggedNodes = async (
    projId: number
): Promise<ITaggedNode[]> => {
    const response = await axiosWrapper(
        axios.post<ITaggedNode[]>(
            `${baseUrl}/taggednodes/proj`,
            {
                projId: projId,
            },
            getAuthConfig()
        )
    );
    return response || [];
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

const addNodeTagName = async (
    projId: number,
    nodeId: number,
    tagName: string
): Promise<ITag | undefined> => {
    const tagColor = 'red';

    const response = await axiosWrapper(
        axios.post<ITag>(
            `${baseUrl}/node/tagname`,
            {
                projId: projId,
                nodeId: nodeId,
                tagName: tagName,
                tagColor: tagColor,
            },
            getAuthConfig()
        )
    );

    const isValidITag = (tag: ITag | undefined): tag is ITag => {
        return (
            tag !== undefined &&
            tag.id !== undefined &&
            tag.project_id !== undefined &&
            tag.label !== undefined &&
            tag.color !== undefined
        );
    };

    if (isValidITag(response)) {
        return response;
    }

    return undefined;
};

const addNodeTagId = async (
    projId: number,
    nodeId: number,
    tagId: number
): Promise<ITaggedNode | undefined> => {
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
};

const removeNodeTagId = async (
    projId: number,
    nodeId: number,
    tagId: number
): Promise<ITaggedNode | undefined> => {
    const response: ITaggedNode | undefined = await axiosWrapper(
        axios.post<ITaggedNode>(
            `${baseUrl}/node/tagid/remove`,
            {
                projId: projId,
                nodeId: nodeId,
                tagId: tagId,
            },
            getAuthConfig()
        )
    );
    return response;
};

export {
    getAllProjTags,
    sendTag,
    deleteTag,
    updateTag,
    addNodeTagName,
    addNodeTagId,
    getAllProjTaggedNodes,
    removeNodeTagId,
};
