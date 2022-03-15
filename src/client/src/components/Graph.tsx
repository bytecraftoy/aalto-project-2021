import React, { useEffect, useState, useRef } from 'react';
import { IEdge, INode, IProject, ProjectPermissions } from '../../../../types';
import * as layoutService from '../services/layoutService';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    Node,
    Elements,
    ReactFlowProvider,
    Edge,
    Connection,
    ArrowHeadType,
    addEdge,
    FlowElement,
    isNode,
    isEdge,
    removeElements,
    ConnectionLineType,
} from 'react-flow-renderer';
import { NodeNaming } from './NodeNaming';
import { Toolbar, ToolbarHandle } from './Toolbar';
import { basicNode } from '../App';

const graphStyle = {
    height: '100%',
    width: 'auto',
    margin: 'auto',
    backgroundColor: '#eeefff',
    backgroundImage:
        'linear-gradient(to bottom right, #00164f, #4e009c, #290066)',
};

export interface GraphProps {
    selectedProject: IProject | undefined;
    permissions: ProjectPermissions;
    elements: Elements;
    DefaultNodeType: string;
    sendNode: (
        data: INode,
        node: Node,
        setElements: React.Dispatch<React.SetStateAction<Elements>>
    ) => Promise<void>;
    deleteNode: (node: number) => Promise<void>;
    deleteEdge: (source: number, target: number) => Promise<void>;
    updateNode: (node: INode) => Promise<void>;
    getElements: (
        project: IProject,
        setElements: React.Dispatch<React.SetStateAction<Elements>>
    ) => Promise<void>;
    sendCreatedNode: (
        node: INode,
        elements: Elements,
        setElements: React.Dispatch<React.SetStateAction<Elements>>
    ) => Promise<void>;
    sendEdge: (edge: IEdge) => Promise<void>;
    updateNodes: (
        elements: Elements,
        setElements: React.Dispatch<React.SetStateAction<Elements>>
    ) => Promise<void>;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    onElementClick: (event: React.MouseEvent, element: FlowElement) => void;
}

interface FlowInstance {
    fitView: () => void;
    project: (pos: { x: number; y: number }) => { x: number; y: number };
}

export const Graph = (props: GraphProps): JSX.Element => {
    const selectedProject = props.selectedProject;
    const permissions = props.permissions;

    const elements = props.elements;
    const setElements = props.setElements;

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] =
        useState<FlowInstance | null>(null);
    const [nodeHidden, setNodeHidden] = useState(false);

    const connectButtonRef = useRef<ToolbarHandle>();

    // For detecting the os
    const platform = navigator.userAgent;

    // State for keeping track of node source handle sizes
    const [connectState, setConnectState] = useState(false);

    // CSS magic to style the node handles when pressing shift or clicking button
    const switchConnectState = (newValue: boolean): void => {
        if (newValue === true) {
            document.body.style.setProperty('--bottom-handle-size', '100%');
            document.body.style.setProperty(
                '--source-handle-border-radius',
                '0'
            );
            document.body.style.setProperty('--source-handle-opacity', '0');
            if (connectButtonRef.current) {
                connectButtonRef.current.setConnectText('Connecting');
            }
        } else {
            document.body.style.setProperty('--bottom-handle-size', '6px');
            document.body.style.setProperty(
                '--source-handle-border-radius',
                '100%'
            );
            document.body.style.setProperty('--source-handle-opacity', '0.5');
            if (connectButtonRef.current) {
                connectButtonRef.current.setConnectText('Connect');
            }
        }
        setConnectState(() => newValue);
    };
    const reverseConnectState = () => switchConnectState(!connectState);

    const onLoad = (_reactFlowInstance: FlowInstance) => {
        _reactFlowInstance.fitView();
        setReactFlowInstance(_reactFlowInstance);
    };

    /**
     * Creates a new node and stores it in the 'elements' React state. Nodes are stored in the database.
     */
    const createNode = async (nodeText: string): Promise<void> => {
        if (selectedProject && permissions.edit) {
            const n: INode = {
                status: 'ToDo',
                label: nodeText,
                priority: 'Urgent',
                x: 5 + elements.length * 10,
                y: 5 + elements.length * 10,
                project_id: selectedProject.id,
            };
            console.log('The node?');
            console.log(n);

            props.sendCreatedNode(n, elements, setElements);
        }
    };

    const onNodeDragStop = async (
        x: React.MouseEvent,
        node: Node<INode>
    ): Promise<void> => {
        if (node.data) {
            const n: INode = {
                ...node.data,
                ...{ x: node.position.x, y: node.position.y },
            };

            setElements((els) =>
                els.map((el) => {
                    const node = el as Node<INode>;
                    if (node.position && node.id === String(n.id)) {
                        node.position = {
                            x: n.x,
                            y: n.y,
                        };
                    }
                    return el;
                })
            );
            props.updateNode(n);
        } else {
            console.log('INode data not found');
        }
    };

    const onNodeNamingDone = async (label: string, node: Node) => {
        if (selectedProject) {
            if (!label) {
                setElements((els) => {
                    return els.filter((e) => e.id !== 'TEMP');
                });

                return;
            }

            const data: INode = {
                ...basicNode,
                ...{
                    label,
                    x: node.position.x,
                    y: node.position.y,
                    project_id: selectedProject.id,
                },
            };

            props.sendNode(data, node, setElements);
        }
    };

    // handle what happens on mousepress press
    const handleMousePress = (event: MouseEvent) => {
        //ctrl (or mac equivalent) is down => create node
        if (
            ((event.metaKey && platform.includes('Macintosh')) ||
                event.ctrlKey) &&
            reactFlowInstance &&
            reactFlowWrapper?.current
        ) {
            const reactFlowBounds =
                reactFlowWrapper.current.getBoundingClientRect();

            const position = reactFlowInstance.project({
                x: Math.floor(event.clientX - reactFlowBounds.left),
                y: Math.floor(event.clientY - reactFlowBounds.top),
            });

            const unnamedNode: Node = {
                id: 'TEMP',
                data: {},
                type: props.DefaultNodeType,
                position,
                draggable: false,
            };

            unnamedNode.data.label = (
                <NodeNaming
                    onNodeNamingDone={async (label) =>
                        onNodeNamingDone(label, unnamedNode)
                    }
                />
            );

            setElements((els) =>
                els.filter((el) => el.id !== 'TEMP').concat(unnamedNode)
            );
        }
    };
    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.shiftKey) {
            switchConnectState(true);
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'Shift') {
            switchConnectState(false);
        }
    };

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress);

        // remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keyup', handleKeyUp);

        // remove the event listener
        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyUp]);

    const onConnectStart = () => {
        document.body.style.setProperty('--top-handle-size', '100%');
        document.body.style.setProperty('--source-handle-visibility', 'none');
        document.body.style.setProperty('--target-handle-border-radius', '0');
        document.body.style.setProperty('--target-handle-opacity', '0');
    };

    const onConnectEnd = () => {
        document.body.style.setProperty('--top-handle-size', '6px');
        document.body.style.setProperty('--source-handle-visibility', 'block');
        document.body.style.setProperty(
            '--target-handle-border-radius',
            '100%'
        );
        document.body.style.setProperty('--target-handle-opacity', '0.5');
    };

    /**
     * Ordering function for elements, puts edges first and nodes last. Used in
     * onElementsRemove.
     */
    const compareElementsEdgesFirst = (
        a: FlowElement,
        b: FlowElement
    ): number => {
        if (isNode(a)) {
            if (isNode(b)) return 0;
            else return 1;
        } else {
            // a is an Edge
            if (isNode(b)) return -1;
            else return 0;
        }
    };

    /**
     * Prop for Graph component, called when nodes or edges are removed. Called also
     * for adjacent edges when a node is removed.
     */
    const onElementsRemove = async (elementsToRemove: Elements) => {
        if (!permissions.edit) {
            return;
        }

        // Must remove edges first to prevent referencing issues in database
        const sortedElementsToRemove = elementsToRemove.sort(
            compareElementsEdgesFirst
        );
        for (const e of sortedElementsToRemove) {
            if (isNode(e)) {
                try {
                    await props.deleteNode(parseInt(e.id));
                } catch (e) {
                    console.log('Error in node deletion', e);
                }
            } else if (isEdge(e)) {
                await props
                    .deleteEdge(parseInt(e.source), parseInt(e.target))
                    .catch((e: Error) =>
                        console.log('Error when deleting edge', e)
                    );
            }
        }

        setElements((els) => removeElements(elementsToRemove, els));
    };

    useEffect(() => {
        // attach the event listener
        document.addEventListener('click', handleMousePress);

        // remove the event listener
        return () => {
            document.removeEventListener('click', handleMousePress);
        };
    }, [handleMousePress]);

    const onConnect = (params: Edge<IEdge> | Connection) => {
        if (params.source === params.target) {
            return;
        }
        if (params.source && params.target && selectedProject) {
            //This does not mean params is an edge but rather a Connection

            const edge: IEdge = {
                source_id: parseInt(params.source),
                target_id: parseInt(params.target),
                project_id: selectedProject.id,
            };

            const b: Edge<IEdge> = {
                id: String(params.source) + '-' + String(params.target),
                type: 'straight',
                source: params.source,
                target: params.target,
                arrowHeadType: ArrowHeadType.ArrowClosed,
                data: edge,
            };

            setElements((els) =>
                addEdge(
                    b,
                    els.filter(
                        (e) =>
                            isNode(e) ||
                            !(
                                e.target === params.source &&
                                e.source === params.target
                            )
                    )
                )
            );

            props.sendEdge(edge);
        } else {
            console.log(
                'source or target of edge is null, unable to send to db'
            );
        }
    };
    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress);

        // remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    const layoutWithDagre = async (direction: string) => {
        //applies the layout
        const newElements = layoutService.dagreLayout(elements, direction);

        //sends updated node positions to backend
        await props.updateNodes(newElements, setElements);
    };

    //does force direced iterations, without scrambling the nodes
    const forceDirected = async () => {
        const newElements = layoutService.forceDirectedLayout(elements, 5);

        await props.updateNodes(newElements, setElements);
    };
    useEffect(() => {
        setElements((els) =>
            els.map((el) => {
                if (isNode(el)) {
                    const node: INode = el.data;
                    if (node.status == 'Done') {
                        el.isHidden = nodeHidden;
                        for (const e of els) {
                            if (
                                isEdge(e) &&
                                (e.source == el.id || e.target == el.id)
                            ) {
                                e.isHidden = nodeHidden;
                            }
                        }
                    }
                }
                return el;
            })
        );
    }, [nodeHidden, setElements]);

    if (!selectedProject || !permissions || !permissions.view) {
        return <h2>No permissions or project doesn't exist</h2>;
    }
    //for hiding done nodes and edges

    if (!selectedProject) {
        return <></>;
    }

    return (
        <div style={{ height: '100%' }}>
            <h2 style={{ position: 'absolute', color: 'white' }}>Tasks</h2>
            <ReactFlowProvider>
                <div
                    className="flow-wrapper"
                    style={graphStyle}
                    ref={reactFlowWrapper}
                >
                    <ReactFlow
                        id="graph"
                        elements={elements}
                        onConnect={onConnect}
                        connectionLineType={ConnectionLineType.Straight}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        onElementsRemove={onElementsRemove}
                        //onEdge update does not remove edge BUT changes the mouse icon when selecting an edge
                        // so it works as a hitbox detector
                        onEdgeUpdate={() => null}
                        onLoad={onLoad}
                        onNodeDragStop={onNodeDragStop}
                        onElementClick={props.onElementClick}
                        selectionKeyCode={'e'}
                        nodesDraggable={permissions.edit}
                        nodesConnectable={permissions.edit}
                    >
                        <Controls />
                        <Background color="#aaa" gap={16} />
                        <MiniMap
                            nodeStrokeColor={(n) => {
                                if (n.style?.background)
                                    return n.style.background.toString();
                                if (n.type === 'input') return '#0041d0';
                                if (n.type === 'output') return '#ff0072';
                                if (n.type === 'default') return '#1a192b';

                                return '#eee';
                            }}
                            nodeColor={(n) => {
                                if (n.style?.background)
                                    return n.style.background.toString();

                                return '#fff';
                            }}
                            nodeBorderRadius={2}
                            maskColor="#69578c"
                        />
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
            {permissions.edit && (
                <Toolbar
                    createNode={createNode}
                    reverseConnectState={reverseConnectState}
                    layoutWithDagre={layoutWithDagre}
                    setNodeHidden={setNodeHidden}
                    nodeHidden={nodeHidden}
                    ref={connectButtonRef}
                    forceDirected={forceDirected}
                />
            )}
        </div>
    );
};
