import axios from 'axios';
import { axiosWrapper } from './axiosWrapper';
import { ITag, ITaggedNode } from '../../../../types';
import { getAuthConfig } from './userService';
const baseUrl = '/api/tag';
const baseUrl2 = '/api/tag2';

const getAllProjTags = async (
    projId: number
): Promise<
    | {
          tags: ITag[];
          tagged_nodes: ITaggedNode[];
      }
    | undefined
> => {
    const response = await axiosWrapper(
        axios.get<{
            tags: ITag[];
            tagged_nodes: ITaggedNode[];
        }>(`${baseUrl}/${projId}`, getAuthConfig())
    );
    return response;
};

const deleteTag = async (
    projId: number,
    tagId: number
): Promise<{ msg: string }> => {
    const response = await axiosWrapper(
        axios.delete<string>(`${baseUrl2}/${projId}/${tagId}`, getAuthConfig())
    );
    return { msg: response || '' };
};
const updateTag = async (
    projId: number,
    tagId: number,
    tag: ITag
): Promise<void> => {
    const response = await axiosWrapper(
        axios.put(
            `${baseUrl2}/${projId}/${tagId}`,
            { tag: tag },
            getAuthConfig()
        )
    );
    return;
};

const addNodeTagName = async (
    projId: number,
    nodeId: number,
    tagName: string
): Promise<ITag | undefined> => {
    const tagColor = 'red';

    const response = await axiosWrapper(
        axios.post<{
            tag: ITag;
            tagged_node: ITaggedNode;
        }>(
            `${baseUrl}/${projId}/${nodeId}`,
            {
                tag_label: tagName,
                tag_color: tagColor,
            },
            getAuthConfig()
        )
    );

    return response?.tag;
};

const addNodeTagId = async (
    projId: number,
    nodeId: number,
    tagId: number
): Promise<ITaggedNode | undefined> => {
    const response: ITaggedNode | undefined = await axiosWrapper(
        axios.post<ITaggedNode>(
            `${baseUrl}/${projId}/${nodeId}`,
            {
                tag_id: tagId,
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
        axios.delete<ITaggedNode>(
            `${baseUrl}/${projId}/${nodeId}/${tagId}`,
            getAuthConfig()
        )
    );
    return response;
};

export {
    getAllProjTags,
    deleteTag,
    updateTag,
    addNodeTagName,
    addNodeTagId,
    removeNodeTagId,
};
