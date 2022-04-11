import React from 'react';
import { Edge, Elements } from 'react-flow-renderer';
import { IEdge, INode } from '../../../../types';
import './styles/Sidebar.css';
import {
    BsClipboardCheck,
    BsExclamationCircle,
    BsCardHeading,
} from 'react-icons/bs';

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
            <h5>
                #{source ? source.id : 'null'} - #{target ? target.id : 'null'}
            </h5>
            {source ? (
                <>
                    <h2>
                        <BsCardHeading className="icon" />{' '}
                        <b className="title">Source: </b>
                        {source.label}
                    </h2>
                    <p>
                        <BsClipboardCheck className="icon" />{' '}
                        <b className="title">Status: </b>
                        {source.status}
                    </p>
                    <p>
                        <BsExclamationCircle className="icon" />{' '}
                        <b className="title">Priority: </b>
                        {source.priority}
                    </p>
                    {/* <p>ID: {source.id}</p> */}
                </>
            ) : null}
            {target ? (
                <>
                    <h2>
                        <BsCardHeading className="icon" />{' '}
                        <b className="title">Target: </b>
                        {target.label}
                    </h2>
                    <p>
                        <BsClipboardCheck className="icon" />{' '}
                        <b className="title">Status: </b>
                        {target.status}
                    </p>
                    <p>
                        <BsExclamationCircle className="icon" />{' '}
                        <b className="title">Priority: </b>
                        {target.priority}
                    </p>
                    {/* <p>ID: {target.id}</p> */}
                </>
            ) : null}
        </>
    );
};
