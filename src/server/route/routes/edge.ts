import { router } from '../router';
import { Request, Response } from 'express';
import { IEdge } from '../../../../types';
import { db } from '../../dbConfigs';
import {
    checkProjectPermissionByEdgeId,
    checkProjectPermissionByNodeId,
    checkProjectPermissionByProjectId,
} from '../../helper/permissionHelper';
import { projectIo } from '../../helper/socket';

/**
 * GET /api/edge/:id
 * @summary Get edges
 * @description Fetch edges from the project 'id'
 * @response 200 - OK
 */

router.route('/edge/:id').get(async (req: Request, res: Response) => {
    const { projectId, view } = await checkProjectPermissionByProjectId(
        req,
        parseInt(req.params.id)
    );

    if (!projectId || !view) {
        res.status(401).json({ message: 'No permission' });
        return;
    }
    const q = await db.query('SELECT * FROM edge WHERE project_id = $1', [
        projectId,
    ]);
    res.json(q.rows);
});
/**
 * DELETE /api/edge/:source/:target
 * @description Delete an edge connected to 'source' and 'target'
 * @summary Delete an edge
 * @response 200 - OK
 */
router
    .route('/edge/:source/:target')
    .delete(async (req: Request, res: Response) => {
        const source = Number.parseInt(req.params.source);
        const target = Number.parseInt(req.params.target);

        const { edit, projectId } = await checkProjectPermissionByEdgeId(
            req,
            source,
            target
        );

        if (!projectId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }

        req.logger.info({
            message: 'Deleting edge',
            projectId: projectId,
            source,
            target,
        });

        const edge: IEdge = {
            project_id: projectId,
            source_id: source,
            target_id: target,
        };

        await db.query(
            'DELETE FROM edge WHERE source_id = $1 AND target_id = $2',
            [source, target]
        );

        res.status(200).json();

        projectIo
            ?.except(req.get('socketId')!)
            .to(edge.project_id.toString())
            .emit('delete-edge', edge);
    });

// @bodyContent {string} text/plain gives a description of what the JSON body
// sent should look like, but puts just a string in it. Need to look deeper how it works

/**
 * POST /api/edge
 * @summary Create an edge
 * @description Create a new  **edge**
 * @bodyRequired
 * @response 200 - OK
 * @response 403 - Forbidden
 */
router
    .route('/edge')
    .post(async (req: Request, res: Response) => {
        const newEdge: IEdge = req.body;
        const source = newEdge.source_id;
        const target = newEdge.target_id;

        const permissionNode1 = await checkProjectPermissionByNodeId(
            req,
            source
        );
        const permissionNode2 = await checkProjectPermissionByNodeId(
            req,
            target
        );
        if (
            !permissionNode1.projectId ||
            permissionNode1.projectId !== permissionNode2.projectId ||
            !permissionNode1.edit
        ) {
            return res.status(401).json({ message: 'No permission' });
        }

        const projectId = permissionNode1.projectId;

        // We don't want to trust the 'edge' sent in the body
        const edge: IEdge = {
            project_id: projectId,
            source_id: source,
            target_id: target,
        };

        if (source === target) {
            res.status(400)
                .json({ message: 'Source and target were the same' })
                .end();
            return;
        }

        const oldEdge = await db.query(
            'SELECT * FROM edge WHERE (source_id=$1 AND target_id=$2) OR (source_id=$2 AND target_id=$1)',
            [source, target]
        );

        if (oldEdge.rowCount > 0) {
            //if opposite edge exists, flip it around
            req.logger.info({
                message: 'Replacing existing edge with a reversed one',
                projectId,
                source,
                target,
            });

            const oppositeEdge = await db.query(
                'UPDATE edge SET source_id=$1, target_id=$2 WHERE source_id=$2 AND target_id=$1 RETURNING *',
                [source, target]
            );

            if (oppositeEdge.rowCount > 0) {
                res.status(200).json();

                projectIo
                    ?.except(req.get('socketId')!)
                    .to(projectId.toString())
                    .emit('reverse-edge', edge);
            } else {
                res.status(403).json({ message: 'no duplicate edges allowed' });
            }
        } else {
            req.logger.info({
                message: 'Creating edge',
                projectId,
                source,
                target,
            });

            await db.query(
                'INSERT INTO edge (source_id, target_id, project_id) VALUES ($1, $2, $3)',
                [source, target, projectId]
            );

            res.status(200).json();

            projectIo
                ?.except(req.get('socketId')!)
                .to(edge.project_id.toString())
                .emit('add-edge', edge);
        }
    })
    .put((req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    })
    .delete(async (req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    });

export { router as edge };
