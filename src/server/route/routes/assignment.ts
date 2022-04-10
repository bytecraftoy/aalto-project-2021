import { router } from '../router';
import { Request, Response } from 'express';
import { db } from '../../dbConfigs';
import { checkProjectPermission } from '../../helper/permissionHelper';

const assignmentCheck = async (
    req: Request,
    res: Response
): Promise<[number, number, number] | undefined> => {
    const userId: number = parseInt(req.params.userId);
    const nodeId: number = parseInt(req.params.nodeId);

    if (!userId || !nodeId) {
        res.status(403).json({ message: 'Invalid user assignment' });
        return;
    }

    //check user id

    const userQuery = await db.query(
        'SELECT COUNT(*) FROM users WHERE id = $1;',
        [userId]
    );

    if (!Number(userQuery.rows[0].count)) {
        res.status(403).json({ message: 'Invalid user id' });
        return;
    }

    //get project id

    const projectIdQuery = await db.query(
        'SELECT project_id FROM node WHERE id = $1;',
        [nodeId]
    );

    if (!projectIdQuery.rowCount) {
        res.status(403).json({ message: 'Invalid node id' });
        return;
    }

    const projectId: number = projectIdQuery.rows[0].project_id;

    //check permissions

    const permissions = await checkProjectPermission(req, projectId);

    if (!permissions.edit) {
        res.status(401).json({ message: 'No permission' });
        return;
    }

    //return user, node and project ids

    return [userId, nodeId, projectId];
};

router
    .route('/assignment/assign/:nodeId/:userId')
    .post(async (req: Request, res: Response) => {
        const result = await assignmentCheck(req, res);
        if (!result) return;

        const [userId, nodeId, projectId] = result;

        //check whether user belongs to project

        const projectBelongQuery = await db.query(
            'SELECT COUNT(*) FROM users__project WHERE project_id = $1 AND users_id = $2;',
            [projectId, userId]
        );

        if (!Number(projectBelongQuery.rows[0].count)) {
            res.status(403).json({
                message: 'User does not belong to selected project',
            });
            return;
        }

        //check whether user is already assigned

        const userAssignedQuery = await db.query(
            'SELECT COUNT(*) FROM users__node WHERE users_id = $1 AND node_id = $2;',
            [userId, nodeId]
        );

        if (Number(userAssignedQuery.rows[0].count)) {
            res.status(403).json({
                message: 'User is already assigned to task',
            });
            return;
        }

        //assign user

        await db.query(
            'INSERT INTO users__node (users_id, node_id) VALUES ($1, $2);',
            [userId, nodeId]
        );

        res.status(200).json();
    })
    .delete(async (req: Request, res: Response) => {
        const result = await assignmentCheck(req, res);
        if (!result) return;

        const [userId, nodeId] = result;

        //unassign user

        await db.query(
            'DELETE FROM users__node WHERE users_id = $1 AND node_id = $2;',
            [userId, nodeId]
        );

        res.status(200).json();
    });

router.route('/assignment/:nodeId').get(async (req: Request, res: Response) => {
    const nodeId: number = parseInt(req.params.nodeId);

    if (!nodeId) {
        res.status(403).json({ message: 'Invalid node id' });
        return;
    }

    const projectIdQuery = await db.query(
        'SELECT project_id FROM node WHERE id = $1;',
        [nodeId]
    );

    if (!projectIdQuery.rowCount) {
        res.status(403).json({ message: 'Invalid node id' });
        return;
    }

    const projectId: number = projectIdQuery.rows[0].project_id;
    const permissions = await checkProjectPermission(req, projectId);

    if (!permissions.view) {
        res.status(401).json({ message: 'No permission' });
        return;
    }

    const asd = await db.query(
        'SELECT username, email, id FROM users WHERE id IN (SELECT users_id FROM users__node WHERE node_id = $1)',
        [nodeId]
    );

    res.status(200).json(asd.rows);
});

export { router as assignment };
