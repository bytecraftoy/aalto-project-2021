import React /* , { useEffect, useState } */ from 'react';
import { Elements, Node } from 'react-flow-renderer';
import { INode } from '../../../../types';
import { AssignedUsers } from './AssignedUsers';
import { AssignUsers } from './AssignUsers';
import { NodeForm } from './NodeForm';
import { NodeFieldForm } from './NodeFieldForm';
import './styles/Sidebar.css';
import {
    BsClipboardCheck,
    BsExclamationCircle /* BsHash */,
} from 'react-icons/bs';

interface NodeDetailProps {
    element: Node<INode>;
    editAll: boolean;
    editOne: string | null;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditAll: React.Dispatch<React.SetStateAction<boolean>>;
    setEditOne: React.Dispatch<React.SetStateAction<string | null>>;
}

export const NodeDetail = (props: NodeDetailProps): JSX.Element => {
    const data = props.element.data;

    if (!data) {
        return <></>;
    }

    let content;

    /* const handleCancel = () => {
        props.setEditOne('null');
        props.setEditAssign(false);
    }; */

    /* useEffect(() => {
        if(props.editOne === null){
            handleCancel();
        }
    }, [props.editOne]) */

    if (props.editAll) {
        content = (
            <>
                <h2>{data.label}</h2>
                <NodeForm
                    element={props.element}
                    setElements={props.setElements}
                    setEditAll={props.setEditAll}
                />
                <AssignUsers node={data} />
            </>
        );
    } else if (props.editOne !== null) {
        content = (
            <>
                <NodeFieldForm
                    element={props.element}
                    editOne={props.editOne}
                    setElements={props.setElements}
                    setEditOne={props.setEditOne}
                />
            </>
        );
    } else {
        content = (
            <>
                <h2>
                    <span
                        onClick={() => {
                            props.setEditOne('label');
                        }}
                    >
                        {data.label}
                    </span>
                </h2>
                <p
                    className="node-description"
                    onClick={() => {
                        props.setEditOne('description');
                    }}
                >
                    {data.description ? data.description : 'No description'}
                </p>
                <p>
                    <BsClipboardCheck className="icon" />{' '}
                    <b className="title">Status: </b>
                    <span
                        onClick={() => {
                            props.setEditOne('status');
                        }}
                    >
                        {data.status}
                    </span>
                </p>
                <p>
                    <BsExclamationCircle className="icon" />{' '}
                    <b className="title">Priority: </b>
                    <span
                        onClick={() => {
                            props.setEditOne('priority');
                        }}
                    >
                        {data.priority}
                    </span>
                </p>
                <AssignedUsers node={data} setEditOne={props.setEditOne} />
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
