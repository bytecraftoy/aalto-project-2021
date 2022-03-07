import React from 'react';
import { Edge, Elements } from 'react-flow-renderer';
import { IEdge, INode } from '../../../../types';

interface EdgeDetailProps {
    element: Edge<IEdge>;
    elements: Elements;
}

export const EdgeDetail = (props: EdgeDetailProps): JSX.Element => {
    const data = props.element.data;

    if (!data) {
        return <></>;
    }

    const source = props.elements.find((el) => el.id === String(data.source_id))
        ?.data as INode;
    const target = props.elements.find((el) => el.id === String(data.target_id))
        ?.data as INode;

    return (
        <>
            <h5>Edge:</h5>
            {source ? (
                <>
                    <h2>Source: {source.label}</h2>
                    <p>Status: {source.status}</p>
                    <p>Priority: {source.priority}</p>
                    <p>ID: {source.id}</p>
                </>
            ) : null}
            {target ? (
                <>
                    <h2>Target: {target.label}</h2>
                    <p>Status: {target.status}</p>
                    <p>Priority: {target.priority}</p>
                    <p>ID: {target.id}</p>
                </>
            ) : null}
        </>
    );
};
