import React, { FormEvent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Comment, ProjectPermissions, UserToken } from '../../../../types';
import { CommentMessage } from './CommentMessage';
import CSS from 'csstype';

interface CommentSectionProps {
    comments: Comment[];
    sendComment: (content: string) => Promise<void>;
    permissions: ProjectPermissions;
    user?: UserToken;
}

const containerStyle: CSS.Properties = {
    background: '#545454',
    borderRadius: '8px',
    padding: '8px',
    color: 'white',
};

export const CommentSection = (props: CommentSectionProps): JSX.Element => {
    const [content, setContent] = useState<string>('');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await props.sendComment(content);
        setContent('');
    };

    return (
        <>
            <h5>Comments:</h5>
            <div style={containerStyle}>
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
                                placeholder="Enter comment"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleSubmit}>
                                Send
                            </Button>
                        </Form.Group>
                    </Form>
                )}
                {props.comments.length > 0 ? (
                    props.comments
                        .slice()
                        .reverse()
                        .map((comment, i) => (
                            <CommentMessage
                                key={i}
                                comment={comment}
                                user={props.user}
                            />
                        ))
                ) : (
                    <p style={{ textAlign: 'center' }}>No comments</p>
                )}
            </div>
        </>
    );
};
