/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { RegistrationForm } from '../../components/RegistrationForm';

const renderForm = () => {
    const createUser = jest.fn();
    const registration = render(<RegistrationForm createUser={createUser} />);

    return { createUser, registration };
};

describe('<RegistrationForm />', () => {
    test('should be visible to users', () => {
        const { registration } = renderForm();
        const container = registration.container;
        expect(container).toHaveTextContent('Register');

        const inputs = container.querySelectorAll('input');
        expect(inputs).toHaveLength(4);
    });

    test('should send a form given proper values', async () => {
        const { createUser, registration } = renderForm();

        // Email, Username, Password, Confirm Password
        const inputs = registration.container.querySelectorAll('input');
        const form = registration.container.querySelector('form')!;

        fireEvent.change(inputs[0], {
            target: { value: 'mrtest@example.com' },
        });

        fireEvent.change(inputs[1], {
            target: { value: 'Mr.Test' },
        });

        fireEvent.change(inputs[2], {
            target: { value: 'password123' },
        });

        fireEvent.change(inputs[3], {
            target: { value: 'password123' },
        });

        await waitFor(async () => {
            fireEvent.submit(form);
        });

        expect(createUser.mock.calls).toHaveLength(1);
    });

    test('should not submit if the repeated password is incorrect', async () => {
        const { createUser, registration } = renderForm();

        const inputs = registration.container.querySelectorAll('input');
        const form = registration.container.querySelector('form')!;

        fireEvent.change(inputs[0], {
            target: { value: 'mrtest@example.com' },
        });

        fireEvent.change(inputs[1], {
            target: { value: 'Mr.Test' },
        });

        fireEvent.change(inputs[2], {
            target: { value: 'password123' },
        });

        fireEvent.change(inputs[3], {
            target: { value: 'pass' },
        });

        await waitFor(async () => {
            fireEvent.submit(form);
        });

        expect(createUser.mock.calls).toHaveLength(0);
        expect(registration.container).toHaveTextContent(
            'Passwords do not match'
        );
    });

    test('should show appropriate message if email is missing', async () => {
        const { createUser, registration } = renderForm();

        const inputs = registration.container.querySelectorAll('input');
        const form = registration.container.querySelector('form')!;

        fireEvent.change(inputs[1], {
            target: { value: 'Mr.Test' },
        });

        fireEvent.change(inputs[2], {
            target: { value: 'password123' },
        });

        fireEvent.change(inputs[3], {
            target: { value: 'pass123' },
        });

        await waitFor(async () => {
            fireEvent.submit(form);
        });

        expect(createUser.mock.calls).toHaveLength(0);
        expect(registration.container).toHaveTextContent(
            'Fill all the necessary information'
        );
    });

    test('should show appropriate message if username is missing', async () => {
        const { createUser, registration } = renderForm();

        const inputs = registration.container.querySelectorAll('input');
        const form = registration.container.querySelector('form')!;

        fireEvent.change(inputs[0], {
            target: { value: 'mrtest@example.com' },
        });

        fireEvent.change(inputs[2], {
            target: { value: 'password123' },
        });

        fireEvent.change(inputs[3], {
            target: { value: 'password123' },
        });

        await waitFor(async () => {
            fireEvent.submit(form);
        });

        expect(createUser.mock.calls).toHaveLength(0);
        expect(registration.container).toHaveTextContent(
            'Fill all the necessary information'
        );
    });

    test('should show appropriate message if password is missing', async () => {
        const { createUser, registration } = renderForm();

        const inputs = registration.container.querySelectorAll('input');
        const form = registration.container.querySelector('form')!;

        fireEvent.change(inputs[0], {
            target: { value: 'mrtest@example.com' },
        });

        fireEvent.change(inputs[1], {
            target: { value: 'Mr.Test' },
        });

        fireEvent.change(inputs[3], {
            target: { value: 'password123' },
        });

        await waitFor(async () => {
            fireEvent.submit(form);
        });

        expect(createUser.mock.calls).toHaveLength(0);
        expect(registration.container).toHaveTextContent(
            'Fill all the necessary information'
        );
    });

    test('should show appropriate message if password confirmation is missing', async () => {
        const { createUser, registration } = renderForm();

        const inputs = registration.container.querySelectorAll('input');
        const form = registration.container.querySelector('form')!;

        fireEvent.change(inputs[0], {
            target: { value: 'mrtest@example.com' },
        });

        fireEvent.change(inputs[1], {
            target: { value: 'Mr.Test' },
        });

        fireEvent.change(inputs[2], {
            target: { value: 'password123' },
        });

        await waitFor(async () => {
            fireEvent.submit(form);
        });

        expect(createUser.mock.calls).toHaveLength(0);
        expect(registration.container).toHaveTextContent(
            'Fill all the necessary information'
        );
    });
});
