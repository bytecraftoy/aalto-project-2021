import React, { useState } from 'react';
import { IEdge, INode,  ITag, ProjectPermissions, UserToken } from '../../../../types';
import { NodeDetail } from './NodeDetail';
import { BsXLg, BsPencilFill, BsFillTrashFill } from 'react-icons/bs';
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
    addNodeTag: (nodeId: number | undefined, tagName: string) => Promise<boolean>;
    removeNodeTag: (nodeId: number | undefined, tagId: number) => Promise<void>;
}

export const ElementDetail = (props: ElementDetailProps): JSX.Element => {
    const [editMode, setEditMode] = useState<boolean>(false);

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
            buttonRow.push(
                <button
                    key={'editButton'}
                    className="icon-button"
                    onClick={() => setEditMode(!editMode)}
                    id="edit-button"
                >
                    <BsPencilFill />
                </button>
            );
        }
    }
    buttonRow.push(
        <button
            key={'closeButton'}
            className="icon-button"
            onClick={() => props.closeSidebar()}
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
                        editMode={editMode}
                        setElements={props.setElements}
                        setEditMode={setEditMode}
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
