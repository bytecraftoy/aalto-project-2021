/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RenderResult } from '@testing-library/react';

import { Graph } from '../../components/Graph';
import { Elements } from 'react-flow-renderer';

describe('<Graph>', () => {
    beforeAll(() => {
        window.ResizeObserver =
            window.ResizeObserver ||
            jest.fn().mockImplementation(() => ({
                disconnect: jest.fn(),
                observe: jest.fn(),
                unobserve: jest.fn(),
            }));

        Object.defineProperties(window.HTMLElement.prototype, {
            offsetHeight: {
                get() {
                    return parseFloat(this.style.height) || 1;
                },
            },
            offsetWidth: {
                get() {
                    return parseFloat(this.style.width) || 1;
                },
            },
        });
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.SVGElement as any).prototype.getBBox = () => ({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        });
    });

    const testElements = [
        {
            id: '1',
            type: 'input',
            data: { label: 'Input node' },
            position: { x: 100, y: 5 },
        },
        {
            id: '2',
            type: 'default',
            data: { label: 'Default node' },
            position: { x: 100, y: 100 },
        },
        {
            id: '3',
            type: 'output',
            data: { label: 'Output node' },
            position: { x: 100, y: 200 },
        },
        {
            id: 'e1-2',
            source: '1',
            target: '2',
        },
        {
            id: 'e2-3',
            source: '2',
            target: '3',
        },
        {
            id: 'e1-3',
            source: '1',
            target: '3',
        },
    ];

    let testGraph: RenderResult;

    const renderGraph = (elements: Elements) => {
        return render(
            <Graph
                elements={elements}
                onLoad={(reactFlowInstance) => {
                    reactFlowInstance.fitView();
                }}
                setElements={jest.fn()}
                onNodeEdit={jest.fn()}
            />
        );
    };
    
    beforeEach(() => {
        testGraph = renderGraph(testElements);
    });

    test('is visible for users', () => {
        expect(testGraph).toBeVisible;
    });

    test('displays nodes', () => {
        const c = testGraph.container.querySelector('.react-flow');
        expect(c).toHaveTextContent('Input node');
        expect(c).toHaveTextContent('Output node');
        expect(c).toHaveTextContent('Default node');
    });

    test('displays the right amount of nodes', () => {
        const c = testGraph.container.querySelectorAll('.react-flow__node');
        expect(c).toHaveLength(3);
    });

    test('displays the right amount of edges', () => {
        const c = testGraph.container.querySelectorAll('.react-flow__edge');
        expect(c).toHaveLength(3);
    });
});
