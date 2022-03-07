import React, { useState } from 'react';
import { IEdge, INode } from '../../../../types';
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
    type: 'Node' | 'Edge' | null;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    closeSidebar: () => void;
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

    return (
        <div className="detail-sidebar">
            <div className="detail-sidebar-topbar">
                <button
                    className="icon-button"
                    style={{ color: 'orangered' }}
                    onClick={async () => await deleteElement()}
                >
                    <BsFillTrashFill />
                </button>
                {props.type === 'Node' && (
                    <button
                        className="icon-button"
                        onClick={() => setEditMode(!editMode)}
                    >
                        <BsPencilFill />
                    </button>
                )}
                <button
                    className="icon-button"
                    onClick={() => props.closeSidebar()}
                >
                    <BsXLg />
                </button>
            </div>
            <div className="detail-sidebar-content">
                {element && isNode(element) && (
                    <NodeDetail
                        element={element}
                        editMode={editMode}
                        setElements={props.setElements}
                        setEditMode={setEditMode}
                    />
                )}
                {element && isEdge(element) && (
                    <EdgeDetail element={element} elements={props.elements} />
                )}
            </div>
        </div>
    );
};
