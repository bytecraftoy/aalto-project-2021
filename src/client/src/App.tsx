import React, { useEffect, useState } from 'react';
import { Graph } from './components/Graph';
import { Elements, addEdge, removeElements, Edge, Node,Connection, isNode, isEdge, FlowElement } from 'react-flow-renderer';
import * as nodeService from './services/nodeService'
import * as edgeService from "./services/edgeService"
import * as t from './types'

const App: React.FC = () => {

	const [nodeText, setNodeText] = useState('')
	const [elements, setElements] = useState<Elements>([])

	interface FlowInstance {
		fitView: () => void;
	}

	/**
	 * Fetches the elements from a database
	 */
	const getElementsHook = (): void => {
		// console.log("hook")
		nodeService.getAll().then(nodes => {
			edgeService.getAll().then(edges => {
				const nodeElements: Elements = nodes.map(n => (
					{
						id: String(n.id),
						data: { label: n.description },
						position: { x: n.x, y: n.y }
					}
				))

				const edgeElements: Elements = edges.map(e => (
					{
						id: String(e.source_id) + "-" + String(e.target_id),
						source: String(e.source_id),
						target: String(e.target_id)
					}
				))

				setElements(nodeElements.concat(edgeElements));
			});
		});
	};
	useEffect(getElementsHook, [])

	/**
	 * Creates a new node and stores it in the 'elements' React state. Nodes are stored in the database. 
	 */
	const createNode = async(): Promise<void> => {
		const n: t.INode = {
			status: "ToDo",
			description: nodeText,
			priority: "Urgent",
			x: 5 + elements.length * 10,
			y: 5 + elements.length * 10
		}
		const returnId: string | undefined = await nodeService.sendNode(n)
		if(returnId){
			const b: Node = {
				id: String(returnId),
				data: { label: nodeText},
				position: {x: 5 + elements.length * 10, y: 5 + elements.length * 10}
			}
			console.log("WHat is the node?", b)
			setElements(elements.concat(b))
		}
		setNodeText('')
	}

	//Type for the edge does not need to be specified (interface Edge<T = any>)
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onConnect = (params: Edge<any> | Connection) => {
		if (params.source && params.target) {
			setElements((els) => addEdge(params, els))

			edgeService.sendEdge({
				source_id: params.source,
				target_id: params.target
			});
		} else {
			console.log("source or target of edge is null, unable to send to db");
		}
	}

	/**
	 * Ordering function for elements, puts edges first and nodes last. Used in
	 * onElementsRemove.
	 */
	const compareElementsEdgesFirst = (a: FlowElement, b: FlowElement): number => {
		if (isNode(a)) {
			if (isNode(b))
				return 0
			else
				return 1
		} else {	// a is an Edge
			if (isNode(b))
				return -1
			else
				return 0
		}
	}

	/**
	 * Prop for Graph component, called when nodes or edges are removed. Called also 
	 * for adjacent edges when a node is removed.
	 */
	const onElementsRemove = async (elementsToRemove: Elements) => {
		// Must remove edges first to prevent referencing issues in database
		const sortedElementsToRemove = elementsToRemove.sort(compareElementsEdgesFirst)
		for (const e of sortedElementsToRemove) {
			if (isNode(e)) {
				await nodeService.deleteNode(e)
			}
			else if (isEdge(e)) {
				await edgeService.deleteEdge(e).catch((e: Error) => console.log("Error when deleting edge", e))
			}
		}

		setElements((els) => removeElements(elementsToRemove, els))
	}

	const onLoad = (reactFlowInstance: FlowInstance) => reactFlowInstance.fitView();

	return (
		<div>
			<h2>Tasks</h2>
			<div>
				<h3>Add task</h3>
				<div>
					Text: <input id='nodetext' type='text' value={nodeText} onChange={({ target }) => setNodeText(target.value)} />
					<button onClick={createNode}>Add</button>
				</div>
			</div>
			<div className="graph">
				<Graph
					elements={elements}
					onConnect={onConnect}
					onElementsRemove={onElementsRemove}
					onLoad={onLoad}
					onEdgeUpdate={(o, s) => console.log("What are these?", o, s)}
				/>
			</div>

		</div>
	);
}

export default App;
