import supertest from 'supertest';
import { INode, IProject, Registration, User } from '../../../types';
import { Database } from '../dbConfigs';

export const registerRandomUser = async (
    api: supertest.SuperTest<supertest.Test>
) => {
    const user: User = {
        username: (Math.random() + 1).toString(36).substring(7),
        password: (Math.random() + 1).toString(36).substring(7),
        email: (Math.random() + 1).toString(36).substring(7) + '@test.com',
        id: 0,
    };

    const tokens = await registerLoginUser(api, user);
    user.id = tokens.id;
    return {
        user,
        token: tokens.token,
    };
};

export const registerLoginUser = async (
    api: supertest.SuperTest<supertest.Test>,
    user: User
) => {
    const registration: Registration = {
        username: user.username,
        password: user.password,
        email: user.email,
    };

    await api.post('/api/user/register').send(registration);

    const res = await api
        .post('/api/user/login')
        .send({ email: user.email, password: user.password });
    return {
        id: res.body.id,
        token: res.body.token,
    };
};

export const addProject = async (
    db: Database,
    project: IProject
): Promise<number> => {
    const client = await db.getClient();
    let projectId = 0;
    try {
        await client.query('BEGIN');

        const q = await client.query(
            'INSERT INTO project (name, owner_id, description, public_view, public_edit) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [
                project.name,
                project.owner_id,
                project.description,
                project.public_view,
                project.public_edit,
            ]
        );

        projectId = q.rows[0].id;

        client.query(
            'INSERT INTO users__project (users_id, project_id) VALUES ($1, $2)',
            [project.owner_id, projectId]
        );
    } catch (e) {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
    return projectId;
};

export const addDummyProject = async (
    db: Database,
    userId: number
): Promise<number> => {
    const p: IProject = {
        name: 'Test-1',
        description: 'First-project',
        owner_id: userId,
        id: 0,
        public_view: true,
        public_edit: true,
    };

    return addProject(db, p);
};

export const addDummyNodes = async (
    db: Database,
    projectId: number,
    nodes?: INode[]
): Promise<number[]> => {
    const n = nodes || [
        {
            label: 'First-node',
            priority: 'Very Urgent',
            status: 'Doing',
            x: 0,
            y: 0,
            project_id: projectId,
        },
        {
            label: 'Second-node',
            priority: 'Urgent',
            status: 'ToDo',
            x: 1,
            y: 1,
            project_id: projectId,
        },
    ];

    const ids: number[] = [];
    for (const node of n) {
        const res = await db.query(
            'INSERT INTO node (label, priority, status, x, y, project_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
            [
                node.label,
                node.priority,
                node.status,
                node.x,
                node.y,
                node.project_id,
            ]
        );
        ids.push(res.rows[0].id);
    }

    return ids;
};
