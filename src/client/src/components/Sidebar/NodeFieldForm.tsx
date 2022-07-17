import React, { FormEvent, useState, KeyboardEvent } from 'react';
import { INode, Status } from '../../../../../types';
import { Form } from 'react-bootstrap';
import { Elements, isNode, Node } from 'react-flow-renderer';
import * as nodeService from '../../services/nodeService';
import { AssignedUsers } from './AssignedUsers';
import { AssignUsers } from './AssignUsers';
import toast from 'react-hot-toast';
import { socket } from '../../services/socket';
import './Sidebar.css';
import {
    BsCardHeading,
    BsCardText,
    BsClipboardCheck,
    BsExclamationCircle,
} from 'react-icons/bs';

export interface NodeFieldFormProps {
    element: Node<INode>;
    editOne: string | null;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditOne: React.Dispatch<React.SetStateAction<string | null>>;
}

export const NodeFieldForm = (props: NodeFieldFormProps): JSX.Element => {
    const data = props.element.data;

    if (!data) {
        return <></>;
    }

    const [label, setLabel] = useState<string>(data.label);
    const [status, setStatus] = useState<Status>(data.status);
    const [priority, setPriority] = useState<string>(data.priority);
    const [description, setDescription] = useState<string>(data.description);
    const [validated, setValidated] = useState<boolean>(false);

    //const socket = React.useContext(SocketContext)
    const href = window.location.href;
    const url = href.substring(href.indexOf('project'), href.length);

    const handleCancel = () => {
        props.setEditOne(null);
    };

    const handleSubmit = async (event: FormEvent) => {
        const form = event.currentTarget as HTMLFormElement;
        if (form.checkValidity()) {
            setValidated(true);
            handleCancel();
            const node: INode = {
                ...data,
                label,
                status,
                priority,
                description,
            };

            props.setElements((els) =>
                els.map((el) => {
                    if (el.id === String(node.id) && isNode(el)) {
                        node.x = el.position.x;
                        node.y = el.position.y;
                        el.data = node;
                    }
                    return el;
                })
            );

            await nodeService.updateNode(node);
            socket.emit('anything', {}, url);
        } else {
            toast(`❌ ${label ? 'Invalid Task' : 'Label cannot be empty'}`);
        }

        event.preventDefault();
        event.stopPropagation();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            handleCancel();
        }
    };

    const handleSelectKeyDown = (event: KeyboardEvent<HTMLSelectElement>) => {
        if (event.key === 'Escape') {
            handleCancel();
        }
    };

    if (!data) {
        return <></>;
    }

    return (
        <Form
            noValidate
            validated={validated}
            onBlur={handleSubmit}
            onSubmit={handleSubmit}
        >
            {props.editOne === 'label' ? (
                <Form.Group
                    id="label-field"
                    className="mb-3"
                    controlId="labelId"
                >
                    <Form.Label>
                        <BsCardHeading className="icon" /> Label
                    </Form.Label>
                    <Form.Control
                        required
                        type="text"
                        placeholder="Enter label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </Form.Group>
            ) : (
                <h2>
                    <span
                        onClick={() => {
                            props.setEditOne('label');
                        }}
                    >
                        {data.label}
                    </span>
                </h2>
            )}

            {props.editOne === 'description' ? (
                <Form.Group
                    id="description-field"
                    className="mb-3"
                    controlId="descriptionId"
                >
                    <Form.Label>
                        <BsCardText className="icon" /> Description
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </Form.Group>
            ) : (
                <p
                    className="node-description"
                    onClick={() => {
                        props.setEditOne('description');
                    }}
                >
                    {data.description ? data.description : 'No description'}
                </p>
            )}

            {props.editOne === 'status' ? (
                <Form.Group className="mb-3" controlId="statusId">
                    <Form.Label>
                        <BsClipboardCheck className="icon" /> Status
                    </Form.Label>
                    <Form.Select
                        aria-label="Default select example"
                        defaultValue={status}
                        onChange={(e) => setStatus(e.target.value as Status)}
                        onKeyDown={handleSelectKeyDown}
                    >
                        <option value={'Product Backlog'}>
                            Product Backlog
                        </option>
                        <option value={'Sprint Backlog'}>Sprint Backlog</option>
                        <option value={'ToDo'}>ToDo</option>
                        <option value={'Doing'}>Doing</option>
                        <option value={'Code Review'}>Code Review</option>
                        <option value={'Done'}>Done</option>
                        <option value={'Done Done'}>Done Done</option>
                    </Form.Select>
                </Form.Group>
            ) : (
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
            )}

            {props.editOne === 'priority' ? (
                <Form.Group className="mb-3" controlId="priorityId">
                    <Form.Label>
                        <BsExclamationCircle className="icon" /> Priority
                    </Form.Label>
                    <Form.Select
                        aria-label="Default select example"
                        defaultValue={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        onKeyDown={handleSelectKeyDown}
                    >
                        <option value={'Urgent'}>Urgent</option>
                        <option value={'Normal'}>Normal</option>
                        <option value={'Lax'}>Lax</option>
                    </Form.Select>
                </Form.Group>
            ) : (
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
            )}

            {props.editOne === 'user' ? (
                <AssignUsers node={data} />
            ) : (
                <AssignedUsers node={data} setEditOne={props.setEditOne} />
            )}
        </Form>
    );
};
