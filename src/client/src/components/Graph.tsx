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
import { socket } from '../services/socket';
import { Spinner } from 'react-bootstrap';

// This is left here as a possible tip. You can check here whenever
// the socket connects to the server. Right now it happens even though graph is no rendered
// Putting it inside graph cause the connection to happend more than once because of refreshing
/* socket.on('connect', () => {
    console.log('Connected in graph!', socket.id)
}) */

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

    const href = window.location.href;
    const url = href.substring(href.indexOf('project') + 8, href.length);

    const ToolbarRef = useRef<ToolbarHandle>();

    const [isCalculating, setIsCalculating] = useState(false);

    // For detecting the os
    const platform = navigator.userAgent;

    // State for toggling shift + drag
    const [connectState, setConnectState] = useState(false);
    // State for toggling ctrl + click
    const [createState, setCreateState] = useState(false);

    // CSS magic to style the node handles when pressing shift or clicking button
    const switchConnectState = (newValue: boolean): void => {
        if (newValue === true) {
            switchCreateState(false);
            document.body.style.setProperty(
                '--connect-btn-bckg-color',
                '#310062'
            );
            document.body.style.setProperty('--bottom-handle-size', '100%');
            document.body.style.setProperty(
                '--source-handle-border-radius',
                '0'
            );
            document.body.style.setProperty('--source-handle-opacity', '0');
            if (ToolbarRef.current) {
                ToolbarRef.current.setConnectText('Connecting');
            }
        } else {
            document.body.style.setProperty(
                '--connect-btn-bckg-color',
                '#686559'
            );
            document.body.style.setProperty('--bottom-handle-size', '6px');
            document.body.style.setProperty(
                '--source-handle-border-radius',
                '100%'
            );
            document.body.style.setProperty('--source-handle-opacity', '0.5');
            if (ToolbarRef.current) {
                ToolbarRef.current.setConnectText('Connect');
            }
        }
        setConnectState(() => newValue);
    };
    const reverseConnectState = () => switchConnectState(!connectState);

    const switchCreateState = (newValue: boolean): void => {
        if (ToolbarRef.current) {
            if (newValue === true) {
                switchConnectState(false);
                document.body.style.setProperty(
                    '--create-btn-bckg-color',
                    '#310062'
                );
                ToolbarRef.current.setCreateText('Creating');
            } else {
                ToolbarRef.current.setCreateText('Create');
                document.body.style.setProperty(
                    '--create-btn-bckg-color',
                    '#686559'
                );
            }
        }
        setCreateState(() => newValue);
    };
    const reverseCreateState = () => switchCreateState(!createState);

    const onLoad = (_reactFlowInstance: FlowInstance) => {
        _reactFlowInstance.fitView();
        setReactFlowInstance(_reactFlowInstance);
    };

    /**
     * Fetches the elements from a database
     */
    useEffect(() => {
        if (props.elements) {
            setElements(props.elements);
        } else if (selectedProject) {
            props.getElements(selectedProject, setElements);
        }
    }, [selectedProject]);

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
            // eslint-disable-next-line no-console
            console.error('INode data not found');
        }
    };

    const [lastCanceledName, setLastCanceledName] = useState('');

    const removeTempNode = () => {
        setElements((els) => {
            return els.filter((e) => e.id !== 'TEMP');
        });
    };

    const onNodeNamingDone = async (label: string, node: Node) => {
        if (selectedProject) {
            if (!label) {
                removeTempNode();

                return;
            }

            setLastCanceledName('');

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

    const onNodeNamingCancel = (canceledName: string) => {
        setLastCanceledName(canceledName);
        removeTempNode();
    };

    // handle what happens on mousepress press
    const handleMousePress = (event: MouseEvent) => {
        // Don't do anything if clicking on Toolbar area
        if (ToolbarRef.current) {
            const toolbarBounds = ToolbarRef.current.getBounds();
            // "If clicking on Toolbar"
            if (
                event.clientX >= toolbarBounds.left &&
                event.clientY >= toolbarBounds.top &&
                event.clientY <= toolbarBounds.bottom &&
                event.clientX <= toolbarBounds.right
            ) {
                return;
            }
        }

        if (createState && reactFlowInstance && reactFlowWrapper?.current) {
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
                    initialName={lastCanceledName}
                    onNodeNamingDone={async (name) =>
                        onNodeNamingDone(name, unnamedNode)
                    }
                    onCancel={onNodeNamingCancel}
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
        if (
            (platform.includes('Macintosh') && event.metaKey) ||
            event.ctrlKey
        ) {
            switchCreateState(true);
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'Shift') {
            switchConnectState(false);
        }
        if (event.key === 'Control') {
            switchCreateState(false);
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
                    props.deleteNode(parseInt(e.id));
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Error in node deletion', e);
                }
            } else if (isEdge(e)) {
                props
                    .deleteEdge(parseInt(e.source), parseInt(e.target))
                    .catch((e: Error) =>
                        // eslint-disable-next-line no-console
                        console.error('Error when deleting edge', e)
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
            // eslint-disable-next-line no-console
            console.error(
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

    const onNodeDragStart = () => {
        setCreateState(false);
        setConnectState(false);
    };

    const layoutWithDagre = async (direction: string) => {
        setIsCalculating(true);

        //applies the layout
        const newElements = layoutService.dagreLayout(elements, direction);

        //sends updated node positions to backend
        await props.updateNodes(newElements, setElements);

        setIsCalculating(false);
    };

    //does force direced iterations, without scrambling the nodes
    const forceDirected = async () => {
        setIsCalculating(true);

        const newElements = layoutService.forceDirectedLayout(elements, 5);

        await props.updateNodes(newElements, setElements);

        setIsCalculating(false);
    };

    useEffect(() => {
        setElements((els) =>
            els.map((el) => {
                if (isNode(el)) {
                    const node: INode = el.data;
                    if (node.status === 'Done' || node.status === 'Done Done') {
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

    useEffect(() => {
        socket.emit('join-project', url);

        socket.on('add-node', (node) => {
            const n: Node = {
                id: String(node.id),
                data: node,
                type: 'default',
                position: { x: node.x, y: node.y },
                draggable: true,
            };

            setElements((els) => els.concat(n));
        });

        socket.on('delete-node', ({ id }) => {
            setElements((els) => els.filter((e) => e.id !== String(id)));
        });

        socket.on('add-edge', (edge: IEdge) => {
            setElements((els) =>
                els.concat({
                    id: String(edge.source_id) + '-' + String(edge.target_id),
                    source: String(edge.source_id),
                    target: String(edge.target_id),
                    type: 'straight',
                    arrowHeadType: ArrowHeadType.ArrowClosed,
                    data: edge,
                })
            );
        });

        socket.on('delete-edge', (edge: IEdge) => {
            setElements((els) => {
                return els.filter((e) => {
                    return (
                        !isEdge(e) ||
                        e.id !== `${edge.source_id}-${edge.target_id}`
                    );
                });
            });
        });

        socket.on('reverse-edge', (edge: IEdge) => {
            setElements((els) => {
                return els.map((e) => {
                    if (
                        isEdge(e) &&
                        e.id === `${edge.target_id}-${edge.source_id}`
                    ) {
                        return {
                            ...e,
                            id: `${edge.source_id}-${edge.target_id}`,
                            source: e.target,
                            target: e.source,
                            data: edge,
                        };
                    }

                    return e;
                });
            });
        });

        socket.on('update-node', (nodes: INode[]) => {
            setElements((els) =>
                els.map((el) => {
                    const node = nodes.find((n) => n.id === el.data.id);

                    if (!node) return el;

                    return {
                        ...el,
                        data: node,
                        position: { x: node.x, y: node.y },
                    };
                })
            );
        });

        return () => {
            socket.emit('leave-project', url);
            socket.removeAllListeners();
        };
    }, []);

    if (!selectedProject || !permissions || !permissions.view) {
        return <h2>No permissions or project doesn't exist</h2>;
    }
    //for hiding done nodes and edges

    if (!selectedProject) {
        return <></>;
    }

    return (
        <div style={{ height: '100%' }}>
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
                        onNodeDragStart={onNodeDragStart}
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
                        {isCalculating ? (
                            <Spinner
                                animation="border"
                                className="calculating-spinner"
                            />
                        ) : (
                            <></>
                        )}
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
            {permissions.edit && (
                <Toolbar
                    reverseConnectState={reverseConnectState}
                    reverseCreateState={reverseCreateState}
                    layoutWithDagre={layoutWithDagre}
                    setNodeHidden={setNodeHidden}
                    nodeHidden={nodeHidden}
                    ref={ToolbarRef}
                    forceDirected={forceDirected}
                />
            )}
        </div>
    );
};
