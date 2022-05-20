import React, { useState } from 'react';
import {
    IEdge,
    INode,
    ITag,
    ProjectPermissions,
    UserToken,
} from '../../../../types';
import { NodeDetail } from './NodeDetail';
import {
    BsXLg,
    BsPencilFill,
    BsFillTrashFill,
    BsFillCheckCircleFill,
    BsFillPeopleFill,
} from 'react-icons/bs';
import {
    Edge,
    Elements,
    isEdge,
    isNode,
    Node,
    removeElements,
} from 'react-flow-renderer';
import { EdgeDetail } from './EdgeDetail';
import * as nodeService from '../services/nodeService';
import * as edgeService from '../services/edgeService';

interface ElementDetailProps {
    element: Node<INode> | Edge<IEdge> | null;
    elements: Elements;
    permissions: ProjectPermissions;
    type: 'Node' | 'Edge' | null;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    closeSidebar: () => void;
    user?: UserToken;
    nodeTags: ITag[];
    addNodeTag: (
        nodeId: number | undefined,
        tagName: string
    ) => Promise<boolean>;
    removeNodeTag: (nodeId: number | undefined, tagId: number) => Promise<void>;
}

export const ElementDetail = (props: ElementDetailProps): JSX.Element => {
    const [editAll, setEditAll] = useState<boolean>(false);
    const [editOne, setEditOne] = useState<string | null>(null);

    const element = props.element;

    if (!props.element) {
        return <></>;
    }

    const deleteElement = async () => {
        if (!element) {
            return;
        }
        const el = element;
        props.closeSidebar();

        // Get edges to be removed
        const removeEdges = props.elements.filter(
            (el) =>
                props.type === 'Node' &&
                isEdge(el) &&
                (el.source === el.id || el.target === el.id)
        );

        if (props.type === 'Node') {
            const data = props.element as Node<INode>;
            await nodeService.deleteNode(parseInt(data.id));
        } else if (props.type === 'Edge') {
            const data = props.element as Edge<IEdge>;
            await edgeService.deleteEdge(
                parseInt(data.source),
                parseInt(data.target)
            );
        }

        props.setElements((els) => removeElements([el, ...removeEdges], els));
    };

    const buttonRow = [];
    if (props.permissions.edit) {
        buttonRow.push(
            <button
                key={'deleteButton'}
                className="icon-button"
                style={{ color: 'orangered' }}
                onClick={async () => await deleteElement()}
            >
                <BsFillTrashFill />
            </button>
        );

        if (props.type === 'Node') {
            if (editOne !== null) {
                buttonRow.push(
                    <button
                        key={'editOne'}
                        className="icon-button"
                        onClick={() => setEditOne(null)}
                        id="confirm-button"
                    >
                        <BsFillCheckCircleFill />
                    </button>
                );
            } else {
                buttonRow.push(
                    <button
                        key={'editAll'}
                        className="icon-button"
                        onClick={() => setEditAll(!editAll)}
                        id="edit-button"
                    >
                        <BsPencilFill />
                    </button>
                );
                buttonRow.push(
                    <button
                        key={'editOneUser'}
                        className="icon-button"
                        onClick={() => setEditOne('user')}
                        id="user-button"
                    >
                        <BsFillPeopleFill />
                    </button>
                );
            }
        }
    }
    buttonRow.push(
        <button
            key={'closeButton'}
            className="icon-button"
            onClick={() => {
                props.closeSidebar();
                setEditAll(false);
                setEditOne(null);
            }}
            aria-label="Close sidebar"
        >
            <BsXLg />
        </button>
    );

    return (
        <div className="detail-sidebar">
            <div className="detail-sidebar-topbar">{buttonRow}</div>
            <div className="detail-sidebar-content">
                {element && isNode(element) && (
                    <NodeDetail
                        element={element}
                        editAll={editAll}
                        editOne={editOne}
                        setElements={props.setElements}
                        setEditAll={setEditAll}
                        setEditOne={setEditOne}
                        user={props.user}
                        permissions={props.permissions}
                        nodeTags={props.nodeTags}
                        addNodeTag={props.addNodeTag}
                        removeNodeTag={props.removeNodeTag}
                    />
                )}
                {element && isEdge(element) && (
                    <EdgeDetail element={element} elements={props.elements} />
                )}
            </div>
        </div>
    );
};
