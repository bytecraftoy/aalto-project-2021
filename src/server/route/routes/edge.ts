import { router } from '../router';
import { Request, Response } from 'express';
import { IEdge } from '../../../../types';
import { db } from '../../dbConfigs';
import { checkProjectPermission } from '../../helper/permissionHelper';
import { projectIo } from '../../helper/socket';

/**
 * GET /api/edge/:id
 * @summary Get edges
 * @description Fetch edges from the project 'id'
 * @response 200 - OK
 */

router.route('/edge/:id').get(async (req: Request, res: Response) => {
    const project_id = req.params.id;
    const q = await db.query('SELECT * FROM edge WHERE project_id = $1', [
        project_id,
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
        const source = req.params.source;
        const target = req.params.target;

        const edgeQuery = await db.query(
            'SELECT * FROM edge WHERE source_id = $1 AND target_id = $2',
            [source, target]
        );

        if (edgeQuery.rowCount === 0) {
            return res.status(403).json({ message: 'Edge does not exist' });
        }

        const edge: IEdge = edgeQuery.rows[0];

        const permissions = await checkProjectPermission(req, edge.project_id);

        if (!permissions.edit) {
            return res.status(401).json({ message: 'No permission' });
        }

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

        const permissions = await checkProjectPermission(
            req,
            newEdge.project_id
        );
        if (!permissions.edit) {
            return res.status(401).json({ message: 'No permission' });
        }

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
            const oppositeEdge = await db.query(
                'UPDATE edge SET source_id=$1, target_id=$2 WHERE source_id=$2 AND target_id=$1 RETURNING *',
                [source, target]
            );

            if (oppositeEdge.rowCount > 0) {
                res.status(200).json();

                projectIo
                    ?.except(req.get('socketId')!)
                    .to(newEdge.project_id.toString())
                    .emit('reverse-edge', newEdge);
            } else {
                res.status(403).json({ message: 'no duplicate edges allowed' });
            }
        } else {
            await db.query(
                'INSERT INTO edge (source_id, target_id, project_id) VALUES ($1, $2, $3)',
                [source, target, newEdge.project_id]
            );

            res.status(200).json();

            projectIo
                ?.except(req.get('socketId')!)
                .to(newEdge.project_id.toString())
                .emit('add-edge', newEdge);
        }
    })
    .put((req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    })
    .delete(async (req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    });

export { router as edge };
