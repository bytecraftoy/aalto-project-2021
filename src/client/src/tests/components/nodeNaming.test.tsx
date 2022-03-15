/* eslint-disable @typescript-eslint/no-empty-function */
import { NodeNaming } from '../../components/NodeNaming';
import { render, fireEvent } from '@testing-library/react';

describe('<NodeNaming>', () => {
    const getComponent = (
        onNodeNamingDone: (name: string) => void,
        onCancel: (name: string) => void,
        initialName?: string
    ) => {
        return render(
            <NodeNaming
                initialName={initialName}
                onNodeNamingDone={onNodeNamingDone}
                onCancel={onCancel}
            />
        );
    };

    const testInitialName = 'test initial name';

    test('should have one input field', () => {
        const nodeNaming = getComponent(
            () => {},
            () => {}
        );

        expect(nodeNaming.container.querySelectorAll('input')).toHaveLength(1);
    });

    test('input field should be pre-populated with the initial name', () => {
        const nodeNaming = getComponent(
            () => {},
            () => {},
            testInitialName
        );

        expect(nodeNaming.container.querySelector('input')!.value).toBe(
            testInitialName
        );
    });

    test('should call onNodeNamingDone with the correct string when user writes to input field and presses enter', () => {
        const testNodeNamingDone = (name: string) =>
            expect(name).toBe(testInitialName);

        const nodeNaming = getComponent(testNodeNamingDone, () => {});

        fireEvent.change(nodeNaming.container.querySelector('input')!, {
            target: { value: testInitialName },
        });

        fireEvent.submit(nodeNaming.container.querySelector('input')!);

        expect(testNodeNamingDone).toBeCalled;
    });

    test('should call onNodeNamingDone with the correct string when user writes to input field and unfocuses', () => {
        const testNodeNamingDone = (name: string) =>
            expect(name).toBe(testInitialName);

        const nodeNaming = getComponent(testNodeNamingDone, () => {});

        fireEvent.change(nodeNaming.container.querySelector('input')!, {
            target: { value: testInitialName },
        });

        fireEvent.blur(nodeNaming.container.querySelector('input')!);

        expect(testNodeNamingDone).toBeCalled;
    });

    test('should call onCancel with the correct string when user writes to input field and presses escape', () => {
        const testCancel = (name: string) => expect(name).toBe(testInitialName);

        const nodeNaming = getComponent(() => {}, testCancel);

        fireEvent.change(nodeNaming.container.querySelector('input')!, {
            target: { value: testInitialName },
        });

        fireEvent.keyDown(nodeNaming.container.querySelector('input')!, {
            key: 'Escape',
        });

        expect(testCancel).toBeCalled;
    });
});
