import { db } from '../dbConfigs';
import { Request } from 'express';
import { ProjectPermissions } from '../../../types';

export const checkProjectPermission = async (
    req: Request,
    project_id: number
): Promise<ProjectPermissions> => {
    const q = await db.query('SELECT * FROM project WHERE id = $1', [
        project_id,
    ]);

    if (!q.rowCount) {
        throw Error('invalid project');
    }

    const project = q.rows[0];

    if (req.token && req.user) {
        const userId = req.user.id;

        const belongsToProject = await userMemberOfProject(userId, project_id);

        if (!project.public_view) {
            return { view: belongsToProject, edit: belongsToProject };
        } else if (!project.public_edit) {
            return { view: true, edit: belongsToProject };
        }
    }

    return { view: project.public_view, edit: project.public_edit };
};

export const userMemberOfProject = async (
    userId: number,
    projectId: number
): Promise<boolean> => {
    try {
        const query = await db.query(
            'SELECT * FROM users__project WHERE users_id = $1 AND project_id = $2',
            [userId, projectId]
        );

        return query.rowCount > 0;
    } catch (e) {
        return false;
    }
};
