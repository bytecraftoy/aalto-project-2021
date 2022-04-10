import { FormEvent, useState, KeyboardEvent } from 'react';

interface NodeNamingProps {
    initialName?: string;
    onNodeNamingDone: (name: string) => void;
    onCancel: (name: string) => void;
}

export const NodeNaming = (props: NodeNamingProps): JSX.Element => {
    const [nodeName, setnodeName] = useState(props.initialName || '');

    const handleSubmit = (event: FormEvent) => {
        props.onNodeNamingDone(nodeName);
        event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            props.onCancel(nodeName);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    style={{ width: '100%' }}
                    type="text"
                    value={nodeName}
                    onChange={(e) => setnodeName(e.target.value)}
                    onBlur={() => props.onNodeNamingDone(nodeName)}
                    onKeyDown={handleKeyDown}
                />
            </form>
        </div>
    );
};
