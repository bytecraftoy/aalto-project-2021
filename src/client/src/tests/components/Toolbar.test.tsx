/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { Toolbar } from '../../components/Toolbar';

describe('Toolbar', () => {
    let component: RenderResult;
    const mockCreate = jest.fn();

    beforeEach(() => {
        mockCreate.mockRestore();
        component = render(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            <Toolbar createNode={mockCreate} layoutWithDagre={async () => {}} />
        );
    });

    test('calls a function when button is clicked', () => {
        const button = component.container.querySelector('button');
        expect(button).toBeDefined;
        if (button) {
            fireEvent.click(button);
        } else {
            fail('No button found, should never enter this line');
        }

        expect(mockCreate).toBeCalled;
    });

    test('renders the button with proper text', () => {
        const button = component.container.querySelector('button');

        expect(button).toHaveTextContent('Create');
    });

    test('has an empty textbox by default', () => {
        const input = component.container.querySelector('input');
        expect(input).toHaveValue('');
    });

    test('can change the text box value', () => {
        const input = component.container.querySelector('input');
        if (input) {
            fireEvent.change(input, {
                target: { value: 'Add physics' },
            });
            expect(input).toHaveValue('Add physics');
        }
    });
});
