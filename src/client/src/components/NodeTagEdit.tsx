import React, { FormEvent, useState } from 'react';
import { ITag } from '../../../../types';

interface NodeTagEditProps {
    tags: ITag[];
    addTag: (tagName: string) => Promise<boolean>;
    removeTag: (tagId: number) => Promise<void>;
}

export const NodeTagEdit = (props: NodeTagEditProps): JSX.Element => {
    const [formText, setFormText] = useState<string>('');

    const handleSubmit = async (event: FormEvent) => {
        const addTagSuccess = await props.addTag(formText);
        if (addTagSuccess) {
            setFormText('');
        }
        event.preventDefault();
    };

    return (
        <div className="node-tag-edit-view">
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    style={{ width: '100%' }}
                    type="text"
                    placeholder="Enter Tag Name"
                    value={formText}
                    onChange={(e) => {
                        setFormText(e.target.value);
                    }}
                />
            </form>
            
            <div className="node-tag-edit-list">
                {props.tags.map((tag) => (
                    <button
                        className="node-disp-tag"
                        key={tag.id}
                        onClick={async () => {
                            await props.removeTag(tag.id);
                        }}
                    >
                        {tag.label}
                    </button>
                ))}
            </div>
        </div>
    );
};