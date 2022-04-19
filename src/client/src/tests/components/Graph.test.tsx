/**
 * @jest-environment jsdom
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { RenderResult } from '@testing-library/react';

import { Graph, GraphProps } from '../../components/Graph';
import { Elements } from 'react-flow-renderer';
import { store } from '../../store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { IProject, ProjectPermissions } from '../../../../../types';

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
            data: { label: 'Input node', status: 'ToDo' },
            position: { x: 100, y: 5 },
        },
        {
            id: '2',
            type: 'default',
            data: { label: 'Default node', status: 'Done' },
            position: { x: 100, y: 100 },
        },
        {
            id: '3',
            type: 'output',
            data: { label: 'Output node', status: 'Doing' },
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
            public_view: true,
            public_edit: true,
        };

        const permissions: ProjectPermissions = {
            view: selectedProject.public_view,
            edit: selectedProject.public_edit,
            projectId: 1,
        };

        const graphProps: GraphProps = {
            deleteEdge: jest.fn(),
            deleteNode: jest.fn(),
            getElements: jest.fn(),
            sendCreatedNode: jest.fn(),
            sendEdge: jest.fn(),
            sendNode: jest.fn(),
            updateNode: jest.fn(),
            updateNodes: jest.fn(),
            elements: elements,
            selectedProject: selectedProject,
            DefaultNodeType: 'default',
            setElements: jest.fn(),
            onElementClick: jest.fn(),
            permissions: permissions,
        };

        return render(
            <BrowserRouter>
                <Provider store={store}>
                    <Graph {...graphProps} />
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

    test('calls a function when checkbox is checked', () => {
        const cb = testGraph.container.querySelector('input')!;
        expect(cb).toBeDefined;
        fireEvent.change(cb, {
            target: { checked: true },
        });

        const i = testGraph.container.querySelector('Input node')!;
        const o = testGraph.container.querySelector('Output node')!;
        const d = testGraph.container.querySelector('Default node')!;

        expect(cb).toBeChecked;
        expect(i).toBeVisible;
        expect(o).toBeVisible;
        expect(d).not.toBeVisible;
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
