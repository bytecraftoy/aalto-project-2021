/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { Toolbar } from '../../components/Toolbar';

describe('Toolbar', () => {
    let component: RenderResult;
    const mockHidden = jest.fn();
    const mockReverseConnectState = jest.fn();
    const mockReverseCreateState = jest.fn();
    const mockLayout = jest.fn();
    const mockHighlight = jest.fn();

    beforeEach(() => {
        component = render(
            <Toolbar
                layoutWithDagre={mockLayout}
                reverseConnectState={mockReverseConnectState}
                reverseCreateState={mockReverseCreateState}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                forceDirected={async () => {}}
                setNodeHidden={mockHidden}
                nodeHidden={false}
                setLeavesHighlited={mockHighlight}
                leavesHighlited={false}
            />
        );
    });

    test('calls an appropriate function when a button is clicked', () => {
        const buttons = component.container.querySelectorAll('button');
        expect(buttons[0]).toBeDefined;
        fireEvent.click(buttons[0]);
        expect(mockReverseCreateState).toBeCalled;

        expect(buttons[1]).toBeDefined;
        fireEvent.click(buttons[1]);
        expect(mockReverseConnectState).toBeCalled;
    });

    test('renders the button with proper text', () => {
        const button = component.container.querySelector('button');

        expect(button).toHaveTextContent('Create');
    });

    test('does not contain a text field', () => {
        const input = component.container.querySelector('input');
        expect(input).toBeNull;
    });

    test('calls a function when checkbox is checked', () => {
        const cb = component.container.querySelector('input')!;
        expect(cb).toBeDefined;
        fireEvent.change(cb, {
            target: { checked: true },
        });

        expect(cb).toBeChecked;
        expect(mockHidden).toBeCalled;
    });

    test('calls a function when checkbox is checked', () => {
        const cb = component.container.querySelector(
            '#leaf-highlight-checkbox'
        );
        expect(cb).toBeDefined;
        fireEvent.change(cb!, {
            target: { checked: true },
        });

        expect(cb).toBeChecked;
        expect(mockHighlight).toBeCalled;
    });
});
