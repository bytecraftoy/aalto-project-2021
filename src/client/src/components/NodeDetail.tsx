import React, { useState } from 'react';
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
    editOne: boolean;
    editAssign: boolean;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditAll: React.Dispatch<React.SetStateAction<boolean>>;
    setEditOne: React.Dispatch<React.SetStateAction<boolean>>;
    setEditAssign: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NodeDetail = (props: NodeDetailProps): JSX.Element => {
    const data = props.element.data;

    if (!data) {
        return <></>;
    }

    let content;
    const [editLabel, setEditLabel] = useState<boolean>(false);
    const [editDescription, setEditDescription] = useState<boolean>(false);
    const [editStatus, setEditStatus] = useState<boolean>(false);
    const [editPriority, setEditPriority] = useState<boolean>(false);

    /* const handleCancel = () => {
        setEditLabel(false);
        setEditDescription(false);
        setEditStatus(false);
        setEditPriority(false);
        props.setEditAssign(false);
    };

    if(!props.editOne){
        handleCancel();
    } */

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
    } else if(props.editAssign || props.editOne) {
        content = (
            <>
                <NodeFieldForm 
                    element={props.element}
                    editLabel={editLabel}
                    editDescription={editDescription}
                    editStatus={editStatus}
                    editPriority={editPriority}
                    editAssign={props.editAssign}
                    setElements={props.setElements}
                    setEditLabel={setEditLabel}
                    setEditDescription={setEditDescription}
                    setEditStatus={setEditStatus}
                    setEditPriority={setEditPriority}
                    setEditAssign={props.setEditAssign}
                />
            </>
        )
    } else {
        content = (
            <>
                <h2><span onClick={() => {
                    setEditLabel(true)
                    props.setEditOne(true)
                }}>{data.label}</span></h2>
                <p className="node-description" onClick={() => {
                    setEditDescription(!editDescription)
                    props.setEditOne(true)
                }}>
                    {data.description ? (
                        data.description
                    ) : (
                        'No description'
                    )}
                </p>
                <p>
                    <BsClipboardCheck className="icon" />{' '}
                    <b className="title">Status: </b>
                    <span onClick={() => {
                        setEditStatus(!editStatus)
                        props.setEditOne(true)
                    }}>{data.status}</span>
                </p>
                <p>
                    <BsExclamationCircle className="icon" />{' '}
                    <b className="title">Priority: </b>
                    <span onClick={() => {
                        setEditPriority(!editPriority)
                        props.setEditOne(true)
                    }}>{data.priority}</span>
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
