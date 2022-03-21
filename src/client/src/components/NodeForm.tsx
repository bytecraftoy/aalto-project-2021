import React, { FormEvent, useState } from 'react';
import { INode, Status } from '../../../../types';
import { Form, Button } from 'react-bootstrap';
import { Elements, isNode, Node } from 'react-flow-renderer';
import * as nodeService from '../services/nodeService';
import toast from 'react-hot-toast';
import { socket } from '../services/socket';

export interface NodeFormProps {
    element: Node<INode>;
    setElements: React.Dispatch<React.SetStateAction<Elements>>;
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NodeForm = (props: NodeFormProps): JSX.Element => {
    const data = props.element.data;

    if (!data) {
        return <></>;
    }

    const [label, setLabel] = useState<string>(data.label);
    const [status, setStatus] = useState<Status>(data.status);
    const [priority, setPriority] = useState<string>(data.priority);
    const [validated, setValidated] = useState<boolean>(false);

    //const socket = React.useContext(SocketContext)
    const href = window.location.href;
    const url = href.substring(href.indexOf('project'), href.length);

    const handleSubmit = async (event: FormEvent) => {
        const form = event.currentTarget as HTMLFormElement;
        if (form.checkValidity()) {
            setValidated(true);
            props.setEditMode(false);
            const node: INode = {
                ...data,
                label,
                status,
                priority,
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

    const handleCancel = () => {
        props.setEditMode(false);
    };

    if (!data) {
        return <></>;
    }

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group id="label-field" className="mb-3" controlId="labelId">
                <Form.Label>Label</Form.Label>
                <Form.Control
                    required
                    type="text"
                    placeholder="Enter label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="statusId">
                <Form.Label>Status</Form.Label>
                <Form.Select
                    aria-label="Default select example"
                    defaultValue={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
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
            <Form.Group className="mb-3" controlId="priorityId">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                    aria-label="Default select example"
                    defaultValue={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value={'Urgent'}>Urgent</option>
                    <option value={'Normal'}>Normal</option>
                    <option value={'Lax'}>Lax</option>
                </Form.Select>
            </Form.Group>

            <div id="node-form-button-row" className="flex-space-between">
                <Button variant="primary" type="submit">
                    Save
                </Button>

                <Button variant="danger" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        </Form>
    );
};
