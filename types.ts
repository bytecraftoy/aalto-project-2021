export type Status =
    | 'Product Backlog'
    | 'Sprint Backlog'
    | 'ToDo'
    | 'Doing'
    | 'Code Review'
    | 'Done'
    | 'Done Done';

// Id of a node is optional since the id is created in the database
// so when sent to backend we don't give it any id

export interface INode {
    label: string;
    status: Status;
    priority: string;
    id?: number;
    x: number;
    y: number;
    project_id: number;
    description: string;
}

export interface IEdge {
    source_id: number;
    target_id: number;
    project_id: number;
}

export interface IProject {
    id: number;
    owner_id: number;
    name: string;
    description: string;
    public_view: boolean;
    public_edit: boolean;
}

export interface Registration {
    username: string;
    password: string;
    email: string;
}

export interface RegisterFormProps {
    createUser: (user: Registration) => Promise<boolean>;
}

export interface Login {
    email: string | null;
    username: string | null;
    password: string;
}

export interface UserToken {
    username: string;
    email: string;
    token: string;
    id: number;
}

export interface User {
    username: string;
    password: string;
    email: string;
    id: number;
}

export interface UserData {
    username: string;
    email: string;
    id: number;
}

export interface RootState {
    project: IProject[];
}

export interface ToolbarProps {
    reverseConnectState: () => void;
    reverseCreateState: () => void;
    layoutWithDagre: (direction: string) => Promise<void>;
    setNodeHidden: (value: React.SetStateAction<boolean>) => void;
    nodeHidden: boolean;
    forceDirected: () => Promise<void>;
}

export interface ProjectPermissions {
    view: boolean;
    edit: boolean;
}

export interface ITag {
    id: number;
    label: string;
    color: string;
    project_id: number;
}

export interface ITaggedNode {
    node_id: string;
    tag_id: number;
    project_id: number;
}
