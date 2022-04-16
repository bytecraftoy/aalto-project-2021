import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    useRef,
} from 'react';
import { ToolbarProps } from '../../../../types';

export type ToolbarHandle = {
    setCreateText: (newText: string) => void;
    setConnectText: (newText: string) => void;
    getBounds: () => DOMRect;
};

// This slightly very confusing because of Typescript
export const Toolbar = forwardRef((props: ToolbarProps, ref): JSX.Element => {
    const [createText, setCreateText] = useState('Create');
    const nodeHidden = props.nodeHidden;
    const [connectText, setConnectText] = useState('Connect');
    // The following two change Graph.tsx's states
    const reverseConnectState = props.reverseConnectState;
    const reverseCreateState = props.reverseCreateState;
    const layoutWithDagre = props.layoutWithDagre;
    const hideNode = props.setNodeHidden;
    const forceDirected = props.forceDirected;

    const toolbarDivRef = useRef<HTMLDivElement>(null);

    const getBounds = (): DOMRect | null => {
        if (toolbarDivRef.current) {
            return toolbarDivRef.current.getBoundingClientRect();
        } else {
            return null;
        }
    };

    useImperativeHandle(ref, () => {
        return {
            setCreateText,
            setConnectText,
            getBounds,
        };
    });

    /* The following input field will be removed or re-positioned at some point */
    return (
        <div className="toolbar" ref={toolbarDivRef}>
            <button
                id="createBtn"
                className="button-toolbar"
                onClick={reverseCreateState}
            >
                {createText}
            </button>
            <button
                id="connectBtn"
                className="button-toolbar"
                onClick={reverseConnectState}
            >
                {connectText}
            </button>
            <button
                className="button-layout"
                id="dagreTB"
                onClick={async () => await layoutWithDagre('TB')}
            >
                Vertical Layout
            </button>
            <button
                className="button-layout"
                id="dagreLR"
                onClick={async () => await layoutWithDagre('LR')}
            >
                Horizontal Layout
            </button>
            <button
                className="button-layout"
                id="forceDirected"
                onClick={async () => await forceDirected()}
            >
                Force-directed
            </button>
            <div>
                <input
                    id="hide-done-checkbox"
                    type="checkbox"
                    className="checkbox-toolbar"
                    checked={nodeHidden}
                    onChange={(evt) => hideNode(evt.target.checked)}
                />{' '}
                Hide done tasks
            </div>
            <div>
                <input
                    id="leaf-highlight-checkbox"
                    type="checkbox"
                    className="checkbox-toolbar"
                    checked={props.leavesHighlited}
                    onChange={(evt) =>
                        props.setLeavesHighlited(evt.target.checked)
                    }
                />{' '}
                Highlight doable tasks
            </div>
        </div>
    );
});
