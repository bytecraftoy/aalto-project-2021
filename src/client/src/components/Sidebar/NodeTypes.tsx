import React, { FormEvent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { NodeType, ProjectPermissions, UserToken } from '../../../../../types';
import toast from 'react-hot-toast';

interface Props {
    nodeTypes: NodeType[];
    setType(ty: NodeType): Promise<void>;
    addType(ty: NodeType): Promise<NodeType | undefined>;
    permissions: ProjectPermissions;
    user?: UserToken;
}

export const NodeTypes = (props: Props): JSX.Element => {
    const [newNodeType, setNewNodeType] = useState<NodeType>({
        id: 0,
        label: '',
        color: '',
    });

    const handleSubmit = async (event: FormEvent) => {
        if (newNodeType.label && newNodeType.color) {
            event.preventDefault();
            await props.addType(newNodeType);
            setNewNodeType({ id: 0, label: '', color: '' });
        } else {
            toast('❌ Please input both a label and a type');
        }
    };

    return (
        <>
            <h5>Node type:</h5>
            <div>
                {props.user && props.permissions.edit && (
                    <Form onSubmit={handleSubmit} className="comment-form">
                        <Form.Group
                            id="comment-field"
                            style={{ display: 'flex', marginTop: '8px' }}
                            className="mb-3"
                            controlId={'commentId'}
                        >
                            <Form.Control
                                type="text"
                                placeholder="Label"
                                value={newNodeType.label}
                                onChange={(e) =>
                                    setNewNodeType({
                                        ...newNodeType,
                                        label: e.target.value,
                                    })
                                }
                            />
                            <Form.Control
                                type="text"
                                placeholder="Color"
                                value={newNodeType.color}
                                onChange={(e) =>
                                    setNewNodeType({
                                        ...newNodeType,
                                        color: e.target.value,
                                    })
                                }
                            />
                            <Button variant="primary" onClick={handleSubmit}>
                                Send
                            </Button>
                        </Form.Group>
                    </Form>
                )}
                {props.nodeTypes.length > 0 ? (
                    props.nodeTypes.map((ty, i) => (
                        <div key={`${i}`}>
                            <span>{ty.label}</span>
                            <span>{ty.color}</span>
                            <button onClick={() => props.setType(ty)}>
                                Set type
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center' }}>No types</p>
                )}
            </div>
        </>
    );
};
