/**
 * @jest-environment jsdom
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { RenderResult } from '@testing-library/react';

import { Graph } from '../../components/Graph';
import { Elements } from 'react-flow-renderer';
import { store } from '../../store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { IProject } from '../../../../../types';

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
        const selectedProject: IProject = {
            id: 1,
            owner_id: 1,
            name: 'project',
            description: 'desc',
        };

        return render(
            <BrowserRouter>
                <Provider store={store}>
                    <Graph
                        elements={elements}
                        selectedProject={selectedProject}
                        setElements={jest.fn()}
                        onElementClick={jest.fn()}
                        DefaultNodeType={'default'}
                    />
                </Provider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        testGraph = renderGraph(testElements);
    });

    test('should include Toolbar', () => {
        const toolbar = testGraph.container.querySelector('Toolbar');
        expect(toolbar).toBeVisible;
        expect(toolbar).toBeInTheDocument;
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

    test('changes the Connect button text when clicking it', () => {
        const toolbarButtons =
            testGraph.container.querySelectorAll('.button-toolbar');
        const connectButton = toolbarButtons[1];
        expect(connectButton).toHaveTextContent('Connect');
        fireEvent.click(connectButton);
        expect(connectButton).toHaveTextContent('Connecting');
        fireEvent.click(connectButton);
        expect(connectButton).toHaveTextContent('Connect');
    });

    test('changes the Connect button text when holding Shift', () => {
        const toolbarButtons =
            testGraph.container.querySelectorAll('.button-toolbar');
        const connectButton = toolbarButtons[1];
        expect(connectButton).toHaveTextContent('Connect');
        fireEvent.keyDown(connectButton, { shiftKey: true });
        expect(connectButton).toHaveTextContent('Connecting');
        fireEvent.keyUp(connectButton, { shiftKey: true });
        expect(connectButton).toHaveTextContent('Connect');
    });
});
