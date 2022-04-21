import React, { FormEvent, useState, KeyboardEvent } from 'react';
import { INode, Status } from '../../../../types';
import { Form } from 'react-bootstrap';
import { Elements, isNode, Node } from 'react-flow-renderer';
import * as nodeService from '../services/nodeService';
import toast from 'react-hot-toast';
import { socket } from '../services/socket';
import './styles/Sidebar.css';
import {
    BsCardHeading,
    BsCardText,
    BsClipboardCheck,
    BsExclamationCircle,
} from 'react-icons/bs';

export interface NodeFieldFormProps {
    element: Node<INode>;
    editLabel: boolean;
    editDescription: boolean;
    editStatus: boolean;
    editPriority: boolean;
    editAssign: boolean;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditLabel: React.Dispatch<React.SetStateAction<boolean>>;
    setEditDescription: React.Dispatch<React.SetStateAction<boolean>>;
    setEditStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setEditPriority: React.Dispatch<React.SetStateAction<boolean>>;
    setEditAssign: React.Dispatch<React.SetStateAction<boolean>>;
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
        props.setEditLabel(false);
        props.setEditDescription(false);
        props.setEditStatus(false);
        props.setEditPriority(false);
        props.setEditAssign(false);
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
        <div>
            {props.editLabel ? (
                <div>
                    <Form noValidate validated={validated} onBlur={handleSubmit}>
                        <Form.Group id="label-field" className="mb-3" controlId="labelId">
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
                    </Form>
                    <p className="node-description" onClick={() => {
                        props.setEditDescription(!props.editDescription)
                        /* props.setEditOne(true) */
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
                            props.setEditStatus(!props.editStatus)
                            /* props.setEditOne(true) */
                        }}>{data.status}</span>
                    </p>
                    <p>
                        <BsExclamationCircle className="icon" />{' '}
                        <b className="title">Priority: </b>
                        <span onClick={() => {
                            props.setEditPriority(!props.editPriority)
                            /* props.setEditOne(true) */
                        }}>{data.priority}</span>
                    </p>
                    {/* <AssignedUsers node={data} /> */}
                </div>
                
            ) : props.editDescription ? (
                <div onBlur={handleCancel}>
                    <Form noValidate validated={validated} onBlur={handleSubmit}>
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
                    </Form>
                    <p>hellow</p>
                </div>
            ) : props.editStatus ? (
                <div onBlur={handleCancel}>
                    <Form noValidate validated={validated} onBlur={handleSubmit}>
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
                                <option value={'Product Backlog'}>Product Backlog</option>
                                <option value={'Sprint Backlog'}>Sprint Backlog</option>
                                <option value={'ToDo'}>ToDo</option>
                                <option value={'Doing'}>Doing</option>
                                <option value={'Code Review'}>Code Review</option>
                                <option value={'Done'}>Done</option>
                                <option value={'Done Done'}>Done Done</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                    <p>hellow</p>
                </div>
            ) : props.editPriority ? (
                <div onBlur={handleCancel}>
                    <Form noValidate validated={validated} onBlur={handleSubmit}>
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
                    </Form>
                    <p>hellow</p>
                </div>
            ) : props.editAssign ? (
                <></>
            ) : (
                <></>
            )}
        </div>
    );
};
