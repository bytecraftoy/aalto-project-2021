import { FC } from 'react';

import { Handle, Position, NodeProps } from 'react-flow-renderer';

export const BasicNode: FC<NodeProps> = (props) => {
    console.log(props);
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div
                className="react-flow__node-default"
                style={{ background: props.data.node_type?.color }}
            >
                {props.data.label}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    );
};
