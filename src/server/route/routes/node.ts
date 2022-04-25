import { router } from '../router';
import { Request, Response } from 'express';
import { INode } from '../../../../types';
import { db } from '../../dbConfigs';
import { projectIo } from '../../helper/socket';
import {
    checkProjectPermissionByNodeId,
    checkProjectPermissionByProjectId,
} from '../../helper/permissionHelper';

// Checks need to make sure the node is valid
const nodeCheck = (node: INode): boolean => {
    //Check that the node has all properties
    return Boolean(
        node.label &&
            node.status &&
            node.priority &&
            // eslint-disable-next-line no-prototype-builtins
            node.hasOwnProperty('x') &&
            // eslint-disable-next-line no-prototype-builtins
            node.hasOwnProperty('y') &&
            node.project_id
    );
};

/**
 * GET /api/node/:id
 * @summary Fetch nodes
 * @description Fetch all nodes belonging to the project
 * @pathParam {string} id - Id of the project of which to fetch nodes
 * @response 200 - OK: IEdge =
 * @response 401 - Unauthorized
 * @response 403 - Forbidden
 */
router
    .route('/node/:id')
    .get(async (req: Request, res: Response) => {
        const { view, projectId } = await checkProjectPermissionByProjectId(
            req,
            parseInt(req.params.id)
        );

        if (!projectId || !view) {
            return res.status(401).json({ message: 'No permission' });
        }
        const q = await db.query('SELECT * FROM node WHERE project_id = $1', [
            projectId,
        ]);
        res.json(q.rows);
    })
    /**
     * DELETE /api/node/:id
     * @summary Delete a node
     * @description Deletes the specific node with id ':id' and all edges connected to that node
     * @pathParam {string} id - Node id
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     */
    .delete(async (req: Request, res: Response) => {
        const nodeId = parseInt(req.params.id);

        const { edit, projectId } = await checkProjectPermissionByNodeId(
            req,
            nodeId
        );
        if (!projectId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }

        req.logger.info({
            message: 'Deleting node',
            projectId,
            nodeId,
        });

        await db.query('DELETE FROM node WHERE id = $1', [nodeId]);
        res.status(200).json();

        projectIo
            ?.except(req.get('socketId')!)
            .to(projectId.toString())
            .emit('delete-node', { id: nodeId });
    });

/**
 * POST /api/node
 * @summary Create a node
 * @description Create a new **node** for a **project**. You may need certain privilages to be able to add a node
 * @bodyContent {Node} - application/json
 * @bodyRequired
 * @response 200 - OK
 * @response 401 - Unauthorized
 * @response 403 - Forbidden
 */
router
    .route('/node')
    .post(async (req: Request, res: Response) => {
        // todo: don't send the body over websocket as-is, it might have extra fields
        const text: INode = req.body; //Might have to parse this

        if (nodeCheck(text)) {
            const { projectId, edit } = await checkProjectPermissionByProjectId(
                req,
                text.project_id
            );
            if (!projectId || !edit) {
                return res.status(401).json({ message: 'No permission' });
            }

            req.logger.info({
                message: 'Creating node',
                projectId,
                label: text.label,
            });

            const q = await db.query(
                'INSERT INTO node (label, status, priority, project_id, x, y, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [
                    text.label,
                    text.status,
                    text.priority,
                    projectId,
                    Math.round(text.x),
                    Math.round(text.y),
                    text.description,
                ]
            );

            res.status(200).json({ id: q.rows[0].id });

            projectIo
                ?.except(req.get('socketId')!)
                .to(projectId.toString())
                .emit('add-node', { ...text, id: q.rows[0].id });
        } else {
            res.status(403).json({ message: 'Invalid node' });
        }
    })
    /**
     * PUT /api/node
     * @bodyRequired
     * @summary Update node(s)
     * @description Updates the value of a node(s).
     * @bodyRequired
     * @bodyContent {FullNode[]} - application/json
     * @response 200 - OK
     * @response 403 - Forbidden
     */
    .put(async (req: Request, res: Response) => {
        const data: INode | INode[] = req.body;
        let projectId: number;

        let array: INode[];
        if (Array.isArray(data)) {
            projectId = data[0].project_id;

            if (
                !data.every(
                    (p: INode) => nodeCheck(p) && p.project_id === projectId
                )
            ) {
                return res
                    .status(403)
                    .json({ message: 'Invalid nodes or multiple projectIds' });
            }

            const { edit } = await checkProjectPermissionByProjectId(
                req,
                projectId
            );
            if (!edit) {
                return res.status(401).json({ message: 'No permission' });
            }

            array = data;
        } else {
            projectId = data.project_id;
            if (!nodeCheck(data)) {
                return res.status(403).json({ message: 'Invalid node' });
            }

            const { edit } = await checkProjectPermissionByProjectId(
                req,
                projectId
            );
            if (!edit) {
                return res.status(401).json({ message: 'No permission' });
            }

            array = [data];
        }

        const client = await db.getClient();
        try {
            req.logger.info({
                message: `Updating ${array.length} node(s)`,
                projectId,
                nodeIds: array.map((elem) => elem.id),
            });

            await client.query('BEGIN');
            for (const node of array) {
                await client.query(
                    'UPDATE node SET label = $1, status = $2, priority = $3, x = $4, y = $5, description = $6 WHERE id = $7',
                    [
                        node.label,
                        node.status,
                        node.priority,
                        Math.round(node.x),
                        Math.round(node.y),
                        node.description,
                        node.id,
                    ]
                );
            }
            client.query('COMMIT');

            res.status(200).json();

            projectIo
                ?.except(req.get('socketId')!)
                .to(array[0].project_id.toString())
                .emit('update-node', array);
        } catch (e) {
            // eslint-disable-next-line no-console
            await client.query('ROLLBACK');
            res.status(403).json();
        } finally {
            client.release();
        }
    });

/**
 * POST /api/node/:id/:nodeId/comment
 * @summary Fetch comments
 * @description Fetch **comment(s)** for a **node**. You may need certain privileges to be able to add a node
 * @pathParam {string} id - Id of the project where the node belongs
 * @pathParam {string} nodeId - Id of the node
 * @response 200 - OK
 * @response 401 - Unauthorized
 */
router
    .route('/node/:id/:nodeId/comment')
    .get(async (req: Request, res: Response) => {
        const projectId = parseInt(req.params.id);
        const nodeId = parseInt(req.params.nodeId);

        const permissions = await checkProjectPermissionByProjectId(
            req,
            projectId
        );

        if (!permissions.view) {
            return res.status(401).json({ message: 'No permission' });
        }

        const query = `
            SELECT username, users_id, node_id, created, content
            FROM comment
            LEFT JOIN users ON users_id = users.id
            WHERE node_id = $1
            ORDER BY created ASC
        `;

        const q = await db.query(query, [nodeId]);
        res.json(q.rows);
    })
    /**
     * POST /api/node/:id/:nodeId/comment
     * @summary Create a comment
     * @description Create a new **comment** for a **node**. You may need certain privileges to be able to add a node
     * @bodyContent {string} - Content of the comment
     * @bodyRequired
     * @pathParam {string} id - Id of the project where the node belongs
     * @pathParam {string} nodeId - Id of the node
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     */
    .post(async (req: Request, res: Response) => {
        const projectId = parseInt(req.params.id);
        const nodeId = parseInt(req.params.nodeId);
        const content: string = req.body.content;

        const permissions = await checkProjectPermissionByProjectId(
            req,
            projectId
        );
        if (!permissions.edit || !req.user) {
            return res
                .status(401)
                .json({ message: 'No permission or not an user' });
        }

        if (!content) {
            return res
                .status(403)
                .json({ message: 'No text in comment content' });
        }

        const userId = req.user.id;

        await db.query(
            'INSERT INTO comment (users_id, node_id, content) VALUES ($1, $2, $3)',
            [userId, nodeId, content]
        );
        res.status(200).json();
    });

export { router as node };
