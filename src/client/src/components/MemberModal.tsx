import React, { FC, FormEvent, useState } from 'react';
import { Form, Button, Modal, ListGroup } from 'react-bootstrap';
import { IProject, UserData } from '../../../../types';
import { BsFillTrashFill } from 'react-icons/bs';
import { FaCrown } from 'react-icons/fa';
import CSS from 'csstype';

interface MemberModalProps {
    project: IProject;
    members: UserData[];
    show: boolean;
    allowInvite: boolean;
    handleClose: () => void;
    addMember: (member: string) => Promise<void>;
    deleteMembers: (userId: number) => Promise<void>;
}

const buttonStyle: CSS.Properties = {
    position: 'absolute',
    right: '12px',
    top: '12px',
    height: '16px',
    width: '16px',
    zIndex: '4',
    color: 'orangered',
};

export const MemberModal: FC<MemberModalProps> = (props: MemberModalProps) => {
    const [member, setMember] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await props.addMember(member);
        setShowForm(false);
        setMember('');
    };

    const handleClose = () => {
        setShowForm(false);
        setMember('');
        props.handleClose();
    };

    const getUserRow = (user: UserData) => (
        <ListGroup.Item key={user.id}>
            <span>
                {user.username} ({user.email})
            </span>
            {props.project.owner_id === user.id ? (
                <FaCrown
                    style={Object.assign({}, buttonStyle, {
                        color: 'goldenrod',
                    })}
                />
            ) : (
                <BsFillTrashFill
                    style={Object.assign({}, buttonStyle, {
                        cursor: 'pointer',
                    })}
                    onClick={() => props.deleteMembers(user.id)}
                />
            )}
        </ListGroup.Item>
    );

    return (
        <Modal show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Members</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}
            >
                <ListGroup>{props.members.map(getUserRow)}</ListGroup>

                {showForm && (
                    <Form onSubmit={handleSubmit} className="project-form">
                        <Form.Group
                            id="member-field"
                            style={{ display: 'flex' }}
                            className="mb-3"
                            controlId={'memberId'}
                        >
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={member}
                                onChange={(e) => setMember(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleSubmit}>
                                Add
                            </Button>
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            {props.allowInvite && (
                <Modal.Footer>
                    <Button
                        variant={showForm ? 'danger' : 'primary'}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Discard' : 'Add member'}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};
