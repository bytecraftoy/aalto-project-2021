import { INode, IEdge } from '../../../../types';
import {
    Elements,
    isNode,
    isEdge,
    ArrowHeadType,
    Position,
} from 'react-flow-renderer';
import dagre from 'dagre';
import toast from 'react-hot-toast';

//dagre stuff
//copied almost directly from react flow documentation

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height

const nodeWidth = 300;
const nodeHeight = 50;

export const dagreLayout = (elements: Elements, direction = 'TB'): Elements => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    elements.forEach((el) => {
        if (isNode(el)) {
            dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
        } else {
            dagreGraph.setEdge(el.source, el.target);
        }
    });

    dagre.layout(dagreGraph);

    return elements.map((el) => {
        if (isNode(el)) {
            const nodeWithPosition = dagreGraph.node(el.id);
            el.targetPosition = isHorizontal ? Position.Left : Position.Top;
            el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

            // unfortunately we need this little hack to pass a slightly different position
            // to notify react flow about the change. Moreover we are shifting the dagre node position
            // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
            el.position = {
                x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
        }

        return el;
    });
};

//copy-paste ends
//force-directed stuff

interface coords {
    x: number;
    y: number;
}

//c1 - c2
function subCoords(c1: coords, c2: coords): coords {
    return { x: c1.x - c2.x, y: c1.y - c2.y };
}

function coordLength(c: coords) {
    return Math.sqrt(c.x * c.x + c.y * c.y);
}

//moves c in the direction of dir for length amount
function moveCoordToDir(c: coords, dir: coords, length: number) {
    const dir_len = coordLength(dir);
    c.x += (dir.x / dir_len) * length;
    c.y += (dir.y / dir_len) * length;
}

function negCoord(c: coords) {
    return { x: -c.x, y: -c.y };
}

function hasNaN(c: coords) {
    return isNaN(c.x) || isNaN(c.y);
}

//does not scramble nodes, as this may also be used to make
//the result of some analytic algorithm better
export const forceDirectedLayout = (
    elements: Elements,
    iterations: number
): Elements => {
    const nodes: INode[] = [];
    const edges: IEdge[] = [];

    for (const el of elements) {
        if (isNode(el)) nodes.push(el.data);
        else if (isEdge(el)) edges.push(el.data);
    }

    const layoutedNodes = forceDirected(nodes, edges, iterations);

    const nodeElements: Elements = layoutedNodes.map((n) => ({
        id: String(n.id),
        data: n,
        position: { x: n.x, y: n.y },
    }));

    const edgeElements: Elements = edges.map((e) => ({
        id: String(e.source_id) + '-' + String(e.target_id),
        source: String(e.source_id),
        target: String(e.target_id),
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
        data: e,
    }));

    return nodeElements.concat(edgeElements);
};

const forceDirected = (nodes: INode[], edges: IEdge[], iterations: number) => {
    const N = nodes.length;

    //how much distance the nodes are allowed to move outwards of current graph
    //TODO: maybe define somewhere else?
    const margin = 100;

    let x_min = 0;
    let x_max = 10;
    let y_min = 0;
    let y_max = 10;

    //node positions and edges will be transformed
    //to a form that is more easily calculatable

    const positions = Array<coords>(N);
    const forces = Array<coords>(N); //not really forces but w/e
    const id2idx = new Map<number, number>(); // node id -> index

    //record node positions and calculate bounds
    for (let i = 0; i < N; i++) {
        const node = nodes[i];

        if (node.id) {
            positions[i] = { x: node.x, y: node.y };
            id2idx.set(node.id, i);
        }

        if (node.x < x_min) x_min = node.x;
        else if (node.x > x_max) x_max = node.x;
        if (node.y < y_min) y_min = node.y;
        else if (node.y > y_max) y_max = node.y;
    }

    //apply margin
    x_max += margin;
    y_max += margin;
    x_min -= margin;
    y_min -= margin;

    //map edges to use indexes instead of ids
    const newEdges: coords[] = [];

    for (const e of edges) {
        const x = id2idx.get(e.source_id);
        const y = id2idx.get(e.target_id);

        if (x !== undefined && y !== undefined) {
            newEdges.push({ x, y });
        }
    }

    const k = Math.sqrt(((x_max - x_min) * (y_max - y_min)) / N); //* constant?
    const attraction = (x: number) => (x * x) / k;
    const repulsion = (x: number) => (k * k) / x;
    let t = 2 * k; //vertex movement is capped to this, could be defined better
    const t_step = t / (0.9 * iterations);
    const cool = () => (t -= t_step); //could be calculated better

    //iterate the physical simulation
    for (let i = 0; i < iterations; i++) {
        //calculate repulsion between all nodes
        for (let j = 0; j < N; j++) {
            forces[j] = { x: 0, y: 0 };
            for (let l = 0; l < N; l++) {
                if (j !== l) {
                    const d = subCoords(positions[j], positions[l]);
                    const d_len = coordLength(d);

                    if (d_len !== 0) {
                        moveCoordToDir(forces[j], d, repulsion(coordLength(d)));
                    } else {
                        moveCoordToDir(
                            forces[j],
                            { x: Math.sign(j - l), y: 0 },
                            1000
                        );
                    }
                }
            }
        }

        //calculate attraction between all vertices
        for (const e of newEdges) {
            const d = subCoords(positions[e.x], positions[e.y]);
            const d_len = coordLength(d);

            if (d_len !== 0) {
                moveCoordToDir(forces[e.x], negCoord(d), attraction(d_len));
                moveCoordToDir(forces[e.y], d, attraction(d_len));
            }
        }

        //move vertices
        //movement is capped to t, which is lowered each iteration
        //vertices also will not move past the borders set by width & height
        for (let j = 0; j < N; j++) {
            const pos = positions[j];
            const f = forces[j];
            moveCoordToDir(pos, forces[j], Math.min(t, coordLength(f)));
            pos.x = Math.max(x_min, Math.min(x_max, pos.x));
            pos.y = Math.max(y_min, Math.min(y_max, pos.y));
        }

        //lower temperature (which caps vertex movement)
        cool();
    }

    let broken = false;

    //finally, copy data back to original INodes
    //just editing the nodes in the parameter array did not work
    const newNodes = nodes.map((n, i) => {
        const node = { ...n };
        node.x = positions[i].x;
        node.y = positions[i].y;

        if (hasNaN(positions[i])) broken = true;

        return node;
    });

    if (broken) {
        toast('❌ Error on autolayout');
        return nodes;
    }

    return newNodes;
};
