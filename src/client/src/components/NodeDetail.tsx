import React from 'react';
import { Elements, Node } from 'react-flow-renderer';
import { INode } from '../../../../types';
import { NodeForm } from './NodeForm';

interface NodeDetailProps {
    element: Node<INode>;
    editMode: boolean;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NodeDetail = (props: NodeDetailProps): JSX.Element => {
    const data = props.element.data;

    if (!data) {
        return <></>;
    }

    let content;
    if (props.editMode) {
        content = (
            <>
                <h2>{data.label}</h2>
                <NodeForm
                    element={props.element}
                    setElements={props.setElements}
                    setEditMode={props.setEditMode}
                />
            </>
        );
    } else {
        content = (
            <>
                <h2>{data.label}</h2>
                <p>Status: {data.status}</p>
                <p>Priority: {data.priority}</p>
                <p>ID: {data.id}</p>
            </>
        );
    }

    return (
        <>
            <h5>Node:</h5>
            {content}
        </>
    );
};
