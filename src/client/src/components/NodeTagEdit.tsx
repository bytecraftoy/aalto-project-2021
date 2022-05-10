import { FormEvent, useState } from 'react';
import { ITag } from '../../../../types';
import { BsJournalAlbum } from 'react-icons/bs';

interface NodeTagEditProps {
    tags: ITag[];
    addTag: (tagName: string) => Promise<boolean>;
    removeTag: (tagId: number) => Promise<void>;
}

export const NodeTagEdit = (props: NodeTagEditProps): JSX.Element => {
    const [formText, setFormText] = useState<string>('');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const addTagSuccess = await props.addTag(formText);
        if (addTagSuccess) {
            setFormText('');
        }
    };

    return (
        <div className="node-tag-edit-view">
            <p>
                <BsJournalAlbum className="icon" /> Assign tags:
            </p>
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    style={{ width: '100%' }}
                    type="text"
                    placeholder="Enter tag name"
                    value={formText}
                    onChange={(e) => {
                        setFormText(e.target.value);
                    }}
                />
            </form>

            <div className="node-tag-edit-list">
                <ul>
                    {props.tags.map((tag) => (
                        <li>
                            <button
                                className="node-disp-tag"
                                key={tag.id}
                                onClick={async () => {
                                    await props.removeTag(tag.id);
                                }}
                            >
                                {tag.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
