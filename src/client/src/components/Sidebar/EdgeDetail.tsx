import React from 'react';
import { Edge, Elements } from 'react-flow-renderer';
import { IEdge, INode } from '../../../../../types';
import './Sidebar.css';
import { BsClipboardCheck, BsExclamationCircle } from 'react-icons/bs';
import { HiOutlineArrowNarrowDown } from 'react-icons/hi';

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
                    <h2>{source.label}</h2>
                    <p>
                        <BsClipboardCheck className="icon" /> {source.status}
                    </p>
                    <p>
                        <BsExclamationCircle className="icon" />{' '}
                        {source.priority}
                    </p>
                    {/* <p>ID: {source.id}</p> */}
                </>
            ) : null}
            <HiOutlineArrowNarrowDown
                className="icon"
                id="edge-detail-arrow"
                size="70"
            />
            {target ? (
                <>
                    <h2>{target.label}</h2>
                    <p>
                        <BsClipboardCheck className="icon" /> {target.status}
                    </p>
                    <p>
                        <BsExclamationCircle className="icon" />{' '}
                        {target.priority}
                    </p>
                    {/* <p>ID: {target.id}</p> */}
                </>
            ) : null}
        </>
    );
};
