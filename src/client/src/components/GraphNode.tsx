import { FC } from 'react';

import { Handle, Position, NodeProps } from 'react-flow-renderer';

export const BasicNode: FC<NodeProps> = (props) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div
                className="depsee-node"
                style={{ background: props.data.node_type?.color }}
            >
                {props.data.label}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    );
};
