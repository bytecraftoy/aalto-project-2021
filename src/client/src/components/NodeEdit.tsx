import React, { FormEvent, useState } from 'react';
import { Node } from 'react-flow-renderer';
import { INode } from '../../../../types';
import { basicNode } from '../App';

interface NodeEditProps {
    node: Node<INode>;
    onNodeEdit: (id: string, data: INode) => void;
}

export const NodeEdit = (props: NodeEditProps): JSX.Element => {
    const data = props.node.data;
    const [nodeName, setnodeName] = useState(
        typeof data?.label === 'string' ? data.label : ''
    );

    const handleSubmit = (event: FormEvent) => {
        const newData = { ...basicNode, ...data, ...{ label: nodeName } };

        props.onNodeEdit(props.node.id || '', newData);
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
                    onBlur={handleSubmit}
                />
            </form>
        </div>
    );
};
