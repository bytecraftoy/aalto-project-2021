import React, { FormEvent, useState } from 'react';

interface NodeNamingProps {
    onNodeNamingDone: (label: string) => void;
}

export const NodeNaming = (props: NodeNamingProps): JSX.Element => {
    const [nodeName, setnodeName] = useState('');

    const handleSubmit = (event: FormEvent) => {
        props.onNodeNamingDone(nodeName);
        event.preventDefault();
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    style={{ width: '100%' }}
                    type="text"
                    value={nodeName}
                    onChange={(e) => {
                        setnodeName(e.target.value);
                    }}
                    onBlur={() => props.onNodeNamingDone(nodeName)}
                />
            </form>
        </div>
    );
};
