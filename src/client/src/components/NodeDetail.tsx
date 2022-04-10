import React from 'react';
import { Elements, Node } from 'react-flow-renderer';
import { INode } from '../../../../types';
import { AssignedUsers } from './AssignedUsers';
import { AssignUsers } from './AssignUsers';
import { NodeForm } from './NodeForm';
import './styles/Sidebar.css';
import {
    BsClipboardCheck,
    BsExclamationCircle /* BsHash */,
} from 'react-icons/bs';

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
                <AssignUsers node={data} />
            </>
        );
    } else {
        content = (
            <>
                <h2>{data.label}</h2>
                {data.description && (
                    <p className="node-description">{data.description}</p>
                )}
                <p>
                    <BsClipboardCheck className="icon" />{' '}
                    <b className="title">Status: </b>
                    {data.status}
                </p>
                <p>
                    <BsExclamationCircle className="icon" />{' '}
                    <b className="title">Priority: </b>
                    {data.priority}
                </p>
                {/* <p>
                    <BsHash className="icon" /> <b className="title">ID: </b>
                    {data.id}
                </p> */}
                <AssignedUsers node={data} />
            </>
        );
    }

    return (
        <>
            <h5>#{data.id}</h5>
            {content}
        </>
    );
};
