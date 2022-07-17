import React, { useEffect, useState } from 'react';
import { Elements, Node } from 'react-flow-renderer';
import {
    Comment,
    INode,
    ProjectPermissions,
    UserToken,
    ITag,
} from '../../../../../types';
import * as nodeService from '../../services/nodeService';
import { AssignedUsers } from './AssignedUsers';
import { AssignUsers } from './AssignUsers';
import { CommentSection } from './CommentSection';
import { NodeForm } from './NodeForm';
import { NodeFieldForm } from './NodeFieldForm';
import './Sidebar.css';
import {
    BsClipboardCheck,
    BsExclamationCircle /* BsHash */,
} from 'react-icons/bs';
import { NodeTagEdit } from './NodeTagEdit';

interface NodeDetailProps {
    element: Node<INode>;
    editAll: boolean;
    editOne: string | null;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditAll: React.Dispatch<React.SetStateAction<boolean>>;
    setEditOne: React.Dispatch<React.SetStateAction<string | null>>;
    permissions: ProjectPermissions;
    user?: UserToken;
    nodeTags: ITag[];
    addNodeTag: (
        nodeId: number | undefined,
        tagName: string
    ) => Promise<boolean>;
    removeNodeTag: (nodeId: number | undefined, tagId: number) => Promise<void>;
}

export const NodeDetail = (props: NodeDetailProps): JSX.Element => {
    const data = props.element.data;
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        if (data?.id) {
            nodeService
                .getComments(data.project_id, data.id)
                .then((comments) => setComments(comments));
        } else {
            setComments([]);
        }
    }, [data]);

    if (!data) {
        return <></>;
    }

    const sendComment = async (content: string) => {
        if (data.id) {
            const comment: Comment = {
                username: props.user?.username || '',
                users_id: props.user?.id || 0,
                node_id: data.id || 0,
                created: new Date().toISOString(),
                content,
            };

            await nodeService.sendComment(data.project_id, data.id, content);

            setComments(comments.concat(comment));
        }
    };

    let content;

    /* const handleCancel = () => {
        props.setEditOne('null');
        props.setEditAssign(false);
    }; */

    /* useEffect(() => {
        if(props.editOne === null){
            handleCancel();
        }
    }, [props.editOne]) */

    if (props.editAll) {
        content = (
            <>
                <h2>{data.label}</h2>
                <NodeForm
                    element={props.element}
                    setElements={props.setElements}
                    setEditAll={props.setEditAll}
                />
                <AssignUsers node={data} />
                <NodeTagEdit
                    tags={props.nodeTags}
                    addTag={async (tagName: string): Promise<boolean> => {
                        return props.addNodeTag(data.id, tagName);
                    }}
                    removeTag={(tagId: number): Promise<void> => {
                        return props.removeNodeTag(data.id, tagId);
                    }}
                />
            </>
        );
    } else if (props.editOne !== null) {
        content = (
            <>
                <NodeFieldForm
                    element={props.element}
                    editOne={props.editOne}
                    setElements={props.setElements}
                    setEditOne={props.setEditOne}
                />
            </>
        );
    } else {
        content = (
            <>
                <h2>
                    <span
                        onClick={() => {
                            props.setEditOne('label');
                        }}
                    >
                        {data.label}
                    </span>
                </h2>
                <p
                    className="node-description"
                    onClick={() => {
                        props.setEditOne('description');
                    }}
                >
                    {data.description ? data.description : 'No description'}
                </p>
                <p>
                    <BsClipboardCheck className="icon" />
                    <span
                        onClick={() => {
                            props.setEditOne('status');
                        }}
                    >
                        {data.status}
                    </span>
                </p>
                <p>
                    <BsExclamationCircle className="icon" />
                    <span
                        onClick={() => {
                            props.setEditOne('priority');
                        }}
                    >
                        {data.priority}
                    </span>
                </p>
                <AssignedUsers node={data} setEditOne={props.setEditOne} />
                <CommentSection
                    comments={comments}
                    sendComment={sendComment}
                    user={props.user}
                    permissions={props.permissions}
                />
            </>
        );
    }

    return (
        <>
            <h5>#{data.id}</h5>
            {content}
        </>
    );
};
