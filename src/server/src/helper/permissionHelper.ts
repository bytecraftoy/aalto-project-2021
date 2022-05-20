import { db } from '../dbConfigs';
import { Request } from 'express';
import { ProjectPermissions, NoPermission, IProject } from '../../../../types';

export const noPermission: NoPermission = {
    projectId: undefined,
    view: false,
    edit: false,
};

export const checkProjectPermissionByProjectId = async (
    req: Request,
    projectId: number | unknown
): Promise<ProjectPermissions | NoPermission> => {
    if (typeof projectId !== 'number') {
        return noPermission;
    }

    const q = await db.query<IProject>('SELECT * FROM project WHERE id = $1', [
        projectId,
    ]);

    if (!q.rowCount) {
        return noPermission;
    }

    const project = q.rows[0];

    if (req.token && req.user) {
        const userId = req.user.id;

        const belongsToProject = await userMemberOfProject(userId, projectId);

        if (!project.public_view) {
            return {
                view: belongsToProject,
                edit: belongsToProject,
                projectId: project.id,
            };
        } else if (!project.public_edit) {
            return {
                view: true,
                edit: belongsToProject,
                projectId: project.id,
            };
        }
    }

    return {
        view: project.public_view,
        edit: project.public_edit,
        projectId: project.id,
    };
};

export const checkProjectPermissionByNodeId = async (
    req: Request,
    nodeId: number | unknown
): Promise<ProjectPermissions | NoPermission> => {
    if (typeof nodeId !== 'number') {
        return noPermission;
    }
    const q = await db.query<{ project_id: number }>(
        'SELECT project_id FROM node WHERE id = $1',
        [nodeId]
    );

    if (!q.rowCount) {
        return noPermission;
    }

    return checkProjectPermissionByProjectId(req, q.rows[0].project_id);
};

export const checkProjectPermissionByEdgeId = async (
    req: Request,
    sourceNodeId: number | unknown,
    targetNodeId: number | unknown
): Promise<ProjectPermissions | NoPermission> => {
    if (typeof sourceNodeId !== 'number' || typeof targetNodeId !== 'number') {
        return noPermission;
    }

    const q = await db.query<{ project_id: number }>(
        'SELECT project_id FROM edge WHERE source_id = $1 AND target_id = $2',
        [sourceNodeId, targetNodeId]
    );

    if (!q.rowCount) {
        return noPermission;
    }

    return checkProjectPermissionByProjectId(req, q.rows[0].project_id);
};

export const checkProjectPermissionByTagId = async (
    req: Request,
    tagId: number | unknown
): Promise<ProjectPermissions | NoPermission> => {
    if (typeof tagId !== 'number') {
        return noPermission;
    }

    const q = await db.query<{ project_id: number }>(
        'SELECT project_id FROM tag WHERE id = $1',
        [tagId]
    );

    if (!q.rowCount) {
        return noPermission;
    }

    return checkProjectPermissionByProjectId(req, q.rows[0].project_id);
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
