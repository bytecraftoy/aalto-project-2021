import React, {
    useEffect,
    MouseEvent as ReactMouseEvent,
    useState,
    useRef,
} from 'react';
import { IEdge, INode, IProject } from '../../../../types';
import * as nodeService from '../services/nodeService';
import * as edgeService from '../services/edgeService';
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
import { NodeEdit } from './NodeEdit';
import { Toolbar, ToolbarHandle } from './Toolbar';
import toast from 'react-hot-toast';

const graphStyle = {
    height: '100%',
    width: 'auto',
    margin: 'auto',
    backgroundColor: '#eeefff',
    backgroundImage:
        'linear-gradient(to bottom right, #00164f, #4e009c, #290066)',
};

export interface GraphProps {
    selectedProject: IProject;
    elements: Elements;
    DefaultNodeType: string;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    onElementClick: (event: React.MouseEvent, element: FlowElement) => void;
}

interface FlowInstance {
    fitView: () => void;
    project: (pos: { x: number; y: number }) => { x: number; y: number };
}

export const Graph = (props: GraphProps): JSX.Element => {
    const selectedProject = props.selectedProject;

    const elements = props.elements;
    const setElements = props.setElements;

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] =
        useState<FlowInstance | null>(null);

    const connectButtonRef = useRef<ToolbarHandle>();

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
        if (selectedProject) {
            const n: INode = {
                status: 'ToDo',
                label: nodeText,
                priority: 'Urgent',
                x: 5 + elements.length * 10,
                y: 5 + elements.length * 10,
                project_id: selectedProject.id,
            };
            const returnId = await nodeService.sendNode(n);
            if (returnId !== undefined) {
                n.id = returnId;
                const b: Node<INode> = {
                    id: String(returnId),
                    data: n,
                    position: { x: n.x, y: n.y },
                };
                setElements(elements.concat(b));
            }
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
            await nodeService.updateNode(n);
        } else {
            console.log('INode data not found');
        }
    };

    const onNodeDoubleClick = (
        event: ReactMouseEvent<Element, MouseEvent>,
        node: Node<INode>
    ) => {
        if (node.data && node.id !== 'TEMP') {
            const form = <NodeEdit node={node} onNodeEdit={onNodeEdit} />;

            setElements((els) =>
                els.map((el) => {
                    if (el.id === node.id) {
                        el.data = {
                            ...el.data,
                            label: form,
                        };
                    }
                    return el;
                })
            );
        }
    };

    // handle what happens on mousepress press
    const handleMousePress = (event: MouseEvent) => {
        const onEditDone = async (data: INode, node: Node) => {
            if (selectedProject) {
                const n: INode = {
                    status: 'ToDo',
                    label: data.label,
                    priority: 'Urgent',
                    x: node.position.x,
                    y: node.position.y,
                    project_id: selectedProject.id,
                };

                if (!data.label) {
                    setElements((els) => {
                        return els.filter((e) => e.id !== 'TEMP');
                    });

                    return;
                }

                const returnId = await nodeService.sendNode(n);

                if (returnId) {
                    n.id = returnId;
                    setElements((els) =>
                        els.map((el) => {
                            if (el.id === node.id) {
                                const pos = (el as Node).position;
                                el = {
                                    ...el,
                                    ...{
                                        id: String(returnId),
                                        data: n,
                                        type: props.DefaultNodeType,
                                        position: { x: pos.x, y: pos.y },
                                        draggable: true,
                                    },
                                };
                            }
                            return el;
                        })
                    );
                }
            }
        };

        if (event.ctrlKey && reactFlowInstance && reactFlowWrapper?.current) {
            const reactFlowBounds =
                reactFlowWrapper.current.getBoundingClientRect();
            let position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            position = { x: Math.floor(position.x), y: Math.floor(position.y) };

            const tempExists =
                elements.findIndex((el) => el.id === 'TEMP') >= 0;

            const b: Node = {
                id: 'TEMP',
                data: {},
                type: props.DefaultNodeType,
                position,
                draggable: false,
            };
            b.data.label = (
                <NodeEdit
                    node={b}
                    onNodeEdit={async (_, data) => await onEditDone(data, b)}
                />
            );

            setElements((els) =>
                tempExists
                    ? els.map((el) => (el.id === 'TEMP' ? b : el))
                    : els.concat(b)
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
        // Must remove edges first to prevent referencing issues in database
        const sortedElementsToRemove = elementsToRemove.sort(
            compareElementsEdgesFirst
        );
        for (const e of sortedElementsToRemove) {
            if (isNode(e)) {
                try {
                    await nodeService.deleteNode(parseInt(e.id));
                } catch (e) {
                    console.log('Error in node deletion', e);
                }
            } else if (isEdge(e)) {
                await edgeService
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

            edgeService.sendEdge(edge);
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

    const onNodeEdit = async (id: string, data: INode) => {
        setElements((els) =>
            els.map((el) => {
                if (el.id === id) {
                    el.data = data;
                }
                return el;
            })
        );

        await nodeService.updateNode(data);
    };

    //calls nodeService.updateNode for all nodes
    const updateNodes = async (els: Elements): Promise<void> => {
        for (const el of els) {
            if (isNode(el)) {
                const node: INode = el.data;

                if (node) {
                    node.x = el.position.x;
                    node.y = el.position.y;

                    await nodeService.updateNode(node);
                } else {
                    toast('❌ What is going on?');
                }
            }
        }
    };

    const layoutWithDagre = async (direction: string) => {
        //applies the layout
        const newElements = layoutService.dagreLayout(elements, direction);

        //sends updated node positions to backend
        await updateNodes(newElements);

        setElements(newElements);
    };

    //does force direced iterations, without scrambling the nodes
    const forceDirected = async () => {
        const newElements = layoutService.forceDirectedLayout(elements, 5);

        await updateNodes(newElements);

        setElements(newElements);
    };

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
                        onNodeDoubleClick={onNodeDoubleClick}
                        onElementClick={props.onElementClick}
                        selectionKeyCode={'e'}
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
            <Toolbar
                createNode={createNode}
                reverseConnectState={reverseConnectState}
                layoutWithDagre={layoutWithDagre}
                ref={connectButtonRef}
                forceDirected={forceDirected}
            />
        </div>
    );
};
