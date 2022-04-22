import React, { useState } from 'react';
import { IEdge, INode, ProjectPermissions } from '../../../../types';
import { NodeDetail } from './NodeDetail';
import {
    BsXLg,
    BsPencilFill,
    BsFillTrashFill,
    BsFillCheckCircleFill,
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
}

export const ElementDetail = (props: ElementDetailProps): JSX.Element => {
    const [editAll, setEditAll] = useState<boolean>(false);
    const [editOne, setEditOne] = useState<string | null>(null);
    const [editAssign, setEditAssign] = useState<boolean>(false);

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
                        className="icon-button"
                        onClick={() => setEditAll(!editAll)}
                        id="edit-button"
                    >
                        <BsPencilFill />
                    </button>
                );
            }
        }
    }
    buttonRow.push(
        <button className="icon-button" onClick={() => props.closeSidebar()}>
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
                        editAssign={editAssign}
                        setElements={props.setElements}
                        setEditAll={setEditAll}
                        setEditOne={setEditOne}
                        setEditAssign={setEditAssign}
                    />
                )}
                {element && isEdge(element) && (
                    <EdgeDetail element={element} elements={props.elements} />
                )}
            </div>
        </div>
    );
};
