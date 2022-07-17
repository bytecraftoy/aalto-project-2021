import React from 'react';
import { Comment, UserToken } from '../../../../../types';
import CSS from 'csstype';

interface CommentMessageProps {
    comment: Comment;
    user?: UserToken;
}

const commentStyle: CSS.Properties = {
    background: 'white',
    color: 'black',
    borderRadius: '8px',
    padding: '8px',
    maxWidth: '75%',
    minWidth: '120px',
    position: 'relative',
    display: 'inline-block',
    marginLeft: '4px',
};

const timestampStyle: CSS.Properties = {
    margin: 0,
    position: 'absolute',
    fontSize: '7px',
    right: '8px',
    bottom: '0px',
};

export const CommentMessage = (props: CommentMessageProps): JSX.Element => {
    const comment = props.comment;

    if (!comment) {
        return <></>;
    }

    return (
        <div style={{ margin: '8px 0' }}>
            <p style={{ margin: 0 }}>
                <strong>
                    {props.user?.id === comment.users_id
                        ? 'Me'
                        : comment.username}
                </strong>
            </p>
            <div style={commentStyle} className="speech-bubble">
                <span style={{ margin: '0 0 8px 0' }}>{comment.content}</span>
                <span style={timestampStyle}>
                    {new Date(comment.created).toLocaleString()}
                </span>
            </div>
        </div>
    );
};
