type Status = 'Done' | 'Doing' | 'ToDo';

// Id of a node is optional since the id is created in the database
// so when sent to backend we don't give it any id

export interface INode {
    label: string;
    status: Status;
    priority: string;
    id?: string; //Could there be a more specific ID than just number?
    x: number;
    y: number;
}

export interface IEdge {
    source_id: string;
    target_id: string;
}

export interface Registration {
    username: string;
    password: string;
    email: string;
}

export interface RegisterFormProps {
    createUser: (user: Registration) => Promise<Registration>;
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
    id: string;
}

export interface User {
    username: string;
    password: string;
    email: string;
    id: string;
}

export interface ToolbarProps {
    createNode: (nodeText: string) => Promise<void>;
    layoutWithDagre: (direction: string) => Promise<void>;
}
