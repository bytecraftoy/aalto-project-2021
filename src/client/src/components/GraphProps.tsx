import React from 'react';
import { INode, IEdge, IProject } from '../../../../types';
import { Node, Elements, ArrowHeadType, isNode } from 'react-flow-renderer';

import * as nodeService from '../services/nodeService';
import * as edgeService from '../services/edgeService';

const sendCreatedNode = async (
    node: INode,
    elements: Elements,
    setElements: React.Dispatch<React.SetStateAction<Elements>>
): Promise<void> => {
    const returnId = await nodeService.sendNode(node);
    if (returnId) {
        node.id = returnId;
        const b: Node<INode> = {
            id: String(returnId),
            data: node,
            position: { x: node.x, y: node.y },
        };
        setElements(elements.concat(b));
    }
};

const sendNode = async (
    data: INode,
    node: Node,
    setElements: React.Dispatch<React.SetStateAction<Elements>>
): Promise<void> => {
    const returnId = await nodeService.sendNode(data);

    if (returnId) {
        data.id = returnId;
        setElements((els) =>
            els.map((el) => {
                if (el.id === node.id) {
                    const pos = (el as Node).position;
                    el = {
                        ...el,
                        ...{
                            id: String(returnId),
                            data: data,
                            type: 'default',
                            position: { x: pos.x, y: pos.y },
                            draggable: true,
                        },
                    };
                }
                return el;
            })
        );
    }
};

const deleteNode = async (id: number): Promise<void> => {
    await nodeService.deleteNode(id);
};

const deleteEdge = async (source: number, target: number): Promise<void> => {
    await edgeService.deleteEdge(source, target);
};

const updateNode = async (node: INode): Promise<void> => {
    await nodeService.updateNode(node);
};

const updateNodes = async (
    elements: Elements,
    setElements: React.Dispatch<React.SetStateAction<Elements>>
): Promise<void> => {
    const nodes: INode[] = elements
        .map((el) => {
            if (isNode(el) && el.data) {
                const node = el.data;
                node.x = el.position.x;
                node.y = el.position.y;
                return node;
            }
            return null;
        })
        .filter((el) => el);

    await nodeService.updateNodes(nodes);

    setElements(elements);
};

const getElements = async (
    selectedProject: IProject,
    setElements: React.Dispatch<React.SetStateAction<Elements>>
): Promise<void> => {
    let nodes: INode[];
    let edges: IEdge[];
    try {
        [nodes, edges] = await Promise.all([
            nodeService.getAll(selectedProject.id),
            edgeService.getAll(selectedProject.id),
        ]);
    } catch (e) {
        return;
    }

    const nodeElements: Elements = nodes.map((n) => ({
        id: String(n.id),
        type: 'default',
        data: n,
        position: { x: n.x, y: n.y },
    }));
    // Edge Types: 'default' | 'step' | 'smoothstep' | 'straight'
    const edgeElements: Elements = edges.map((e) => ({
        id: String(e.source_id) + '-' + String(e.target_id),
        source: String(e.source_id),
        target: String(e.target_id),
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
        data: e,
    }));
    setElements(nodeElements.concat(edgeElements));
};

const sendEdge = async (edge: IEdge): Promise<void> => {
    await edgeService.sendEdge(edge);
};

export {
    sendNode,
    deleteNode,
    deleteEdge,
    updateNode,
    getElements,
    sendCreatedNode,
    sendEdge,
    updateNodes,
};
