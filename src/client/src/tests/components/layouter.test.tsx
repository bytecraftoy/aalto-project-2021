/**
 * @jest-environment jsdom
 */
import { Elements, isNode, ArrowHeadType, Position } from 'react-flow-renderer';
import * as layoutService from '../../services/layoutService';

const baseElements1: Elements = [
    {
        id: '8',
        data: {
            id: '8',
            label: 'fsdgjd',
            status: 'ToDo',
            priority: 'Urgent',
            x: 71,
            y: 327,
        },
        position: { x: 71, y: 327 },
    },
    {
        id: '7',
        data: {
            id: '7',
            label: 'sdfgh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 494,
            y: 329,
        },
        position: { x: 494, y: 329 },
    },
    {
        id: '2',
        data: {
            id: '2',
            label: 'sdfg',
            status: 'ToDo',
            priority: 'Urgent',
            x: 278,
            y: 493,
        },
        position: { x: 278, y: 493 },
    },
    {
        id: '4',
        data: {
            id: '4',
            label: 'sfgh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 83,
            y: -19,
        },
        position: { x: 83, y: -19 },
    },
    {
        id: '5',
        data: {
            id: '5',
            label: 'sdfg',
            status: 'ToDo',
            priority: 'Urgent',
            x: 367,
            y: -69,
        },
        position: { x: 367, y: -69 },
    },
    {
        id: '1',
        data: {
            id: '1',
            label: 'dsfgs',
            status: 'ToDo',
            priority: 'Urgent',
            x: -133,
            y: 44,
        },
        position: { x: -133, y: 44 },
    },
    {
        id: '3',
        data: {
            id: '3',
            label: 'sdfh',
            status: 'ToDo',
            priority: 'Urgent',
            x: -82,
            y: 239,
        },
        position: { x: -82, y: 239 },
    },
    {
        id: '6',
        data: {
            id: '6',
            label: 'sfdgjh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 194,
            y: 222,
        },
        position: { x: 194, y: 222 },
    },
    {
        id: '1-6',
        source: '1',
        target: '6',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '5-4',
        source: '5',
        target: '4',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '4-6',
        source: '4',
        target: '6',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '6-8',
        source: '6',
        target: '8',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '6-7',
        source: '6',
        target: '7',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '1-3',
        source: '1',
        target: '3',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '5-7',
        source: '5',
        target: '7',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '7-2',
        source: '7',
        target: '2',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
];

const dagreLayoutedElements1: Elements = [
    {
        id: '8',
        data: {
            id: '8',
            label: 'fsdgjd',
            status: 'ToDo',
            priority: 'Urgent',
            x: 515,
            y: 258,
        },
        position: { x: 514.5000633449092, y: 258 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '7',
        data: {
            id: '7',
            label: 'sdfgh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 293,
            y: 258,
        },
        position: { x: 292.5008375445621, y: 258 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '2',
        data: {
            id: '2',
            label: 'sdfg',
            status: 'ToDo',
            priority: 'Urgent',
            x: 293,
            y: 344,
        },
        position: { x: 292.500918473208, y: 344 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '4',
        data: {
            id: '4',
            label: 'sfgh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 273,
            y: 86,
        },
        position: { x: 272.5005914517794, y: 86 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '5',
        data: {
            id: '5',
            label: 'sdfg',
            status: 'ToDo',
            priority: 'Urgent',
            x: 333,
            y: 0,
        },
        position: { x: 333.00041406337806, y: 0 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '1',
        data: {
            id: '1',
            label: 'dsfgs',
            status: 'ToDo',
            priority: 'Urgent',
            x: 10,
            y: 86,
        },
        position: { x: 10.000686561820583, y: 86 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '3',
        data: {
            id: '3',
            label: 'sdfh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 0,
            y: 172,
        },
        position: { x: 0.00029199901669269414, y: 172 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '6',
        data: {
            id: '6',
            label: 'sfdgjh',
            status: 'ToDo',
            priority: 'Urgent',
            x: 232,
            y: 172,
        },
        position: { x: 232.0005259950012, y: 172 },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
    },
    {
        id: '1-6',
        source: '1',
        target: '6',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '5-4',
        source: '5',
        target: '4',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '4-6',
        source: '4',
        target: '6',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '6-8',
        source: '6',
        target: '8',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '6-7',
        source: '6',
        target: '7',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '1-3',
        source: '1',
        target: '3',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '5-7',
        source: '5',
        target: '7',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
    {
        id: '7-2',
        source: '7',
        target: '2',
        type: 'straight',
        arrowHeadType: ArrowHeadType.ArrowClosed,
    },
];

describe('layouter', () => {
    test('should layout the nodes in a certain way with Dagre', () => {
        const layoutedElements = layoutService.dagreLayout(baseElements1);

        for (const el1 of layoutedElements) {
            const el2 = dagreLayoutedElements1.find((el) => el.id === el1.id);
            expect(el2).toBeDefined;

            if (isNode(el1) && el2 && isNode(el2)) {
                //there's a Math.random() call, so we check if coords are close enough
                expect(Math.abs(el1.position.x - el2.position.x) < 0.01)
                    .toBeTruthy;
                expect(Math.abs(el1.position.y - el2.position.y) < 0.01)
                    .toBeTruthy;
            }
        }
    });
});
