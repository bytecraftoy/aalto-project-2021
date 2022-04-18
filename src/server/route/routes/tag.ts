import { router } from '../router';
import { Request, Response } from 'express';
import { ITag, ITaggedNode } from '../../../../types';
import { db } from '../../dbConfigs';
import {
    checkProjectPermissionByProjectId,
    checkProjectPermissionByTagId,
} from '../../helper/permissionHelper';

router.route('/tag/proj').post(async (req: Request, res: Response) => {
    const projId = req.body.projId;
    
    const { view, projectId } = await checkProjectPermissionByProjectId(
        req,
        parseInt(projId)
    );

    if (!projectId || !view) {
        return res.status(401).json({ message: 'No permission' });
    }

    const q = await db.query('SELECT * FROM tag WHERE project_id = $1', [
        projId,
    ]);
    res.json(q.rows);
});

router.route('/tag/taggednodes/proj').post(async (req: Request, res: Response) => {
    const projId = req.body.projId;

    const q = await db.query('SELECT * FROM tagged_nodes WHERE project_id = $1', [
        projId,
    ]);
    res.json(q.rows);
});

router
    .route('/tag')
    .get(async (req: Request, res: Response) => {
        // todo: check permissions?
        const q = await db.query('SELECT * FROM tag', []);
        res.json(q.rows);
    })
    .post(async (req: Request, res: Response) => {
        const tag: ITag = req.body;

        const { view, projectId } = await checkProjectPermissionByProjectId(
            req,
            tag.project_id
        );

        if (!projectId || !view) {
            return res.status(401).json({ message: 'No permission' });
        }
        
        req.logger.info({
            message: 'Adding tag to node',
            projectId: tag.project_id,
            label: tag.label,
        });

        const q = await db.query(
            // ignores tag.id when inserting into table
            'INSERT INTO tag (label, color, project_id) VALUES ($1, $2, $3) RETURNING id',
            [tag.label, tag.color, tag.project_id]
        );
        res.status(200).json(q);
    })
    .put(async (req: Request, res: Response) => {
        const t: ITag = req.body;

        const { edit, projectId } = await checkProjectPermissionByTagId(
            req,
            t.id
        );

        if (!projectId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }

        req.logger.info({
            message: 'Updating tag',
            projectId,
            tagId: t.id,
        });

        const q = await db.query(
            'UPDATE tag SET label = $1, color = $2 WHERE id = $3 AND project_id = $4',
            [t.label, t.color, t.id, projectId]
        );
        res.status(200).json(q);
    })
    .delete(async (req: Request, res: Response) => {
        const t: ITag = req.body;

        const { edit, projectId } = await checkProjectPermissionByTagId(
            req,
            t.id
        );

        if (!projectId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }

        req.logger.info({
            message: 'Deleting tag',
            projectId: projectId,
            tagId: t.id,
        });

        const q = await db.query(
            'DELETE FROM tag WHERE id = $1 AND project_id = $2',
            [t.id, t.project_id]
        );
        res.status(200).json(q);
    });

router
    .route('/tag/node/tagname')
    .post(async (req: Request, res: Response) => {
        const projId = req.body.projId;
        const nodeId = req.body.nodeId;
        const tagName = req.body.tagName;
        const tagColor = req.body.tagColor;
        
        const insertTagQuery = await db.query(
            'INSERT INTO tag (label, color, project_id) VALUES ($1, $2, $3) RETURNING id, label, color, project_id',
            [tagName, tagColor, projId]
        );
        
        if (insertTagQuery.rowCount == 1) {
            const retTag: ITag = insertTagQuery.rows[0];
            const tagId = retTag.id;

            if (tagId) {
                const insertTaggedNodeQuery = await db.query(
                    'INSERT INTO tagged_nodes (node_id, tag_id, project_id) VALUES ($1, $2, $3)',
                    [nodeId, tagId, projId]
                );
                
                if (insertTaggedNodeQuery.rowCount == 1) {
                    return res.status(200).json(retTag);
                }
            }
        }
        res.status(401).json({error: 'failed to add tagname to tag'});

    });

router
    .route('/tag/node/tagid')
    .post(async (req: Request, res: Response) => {
        const projId: number = req.body.projId;
        const nodeId: number = req.body.nodeId;
        const tagId: number = req.body.tagId;

        if (projId && nodeId && tagId) {
            const insertTaggedNodeQuery = await db.query(
                'INSERT INTO tagged_nodes (node_id, tag_id, project_id) VALUES ($1, $2, $3)',
                [nodeId, tagId, projId]
            );
            
            if (insertTaggedNodeQuery.rowCount == 1) {
                const retTaggedNode: ITaggedNode = insertTaggedNodeQuery.rows[0];
                if (retTaggedNode) {
                    return res.status(200).json(retTaggedNode);
                }
            }
        }
        return res.status(401).json({error: 'failed to add tagId to node'});
    });

router
    .route('/tag/node/tagid/remove')
    .post(async (req: Request, res: Response) => {
        const projId: number = req.body.projId;
        const nodeId: number = req.body.nodeId;
        const tagId: number = req.body.tagId;

        if (projId && nodeId && tagId) {
            const selectTaggedNodeQuery = await db.query(
                'SELECT * FROM tagged_nodes WHERE node_id = $1 AND tag_id = $2 AND project_id = $3',
                [nodeId, tagId, projId]
            );

            if (selectTaggedNodeQuery.rowCount == 1) {
                await db.query(
                    'DELETE FROM tagged_nodes WHERE node_id = $1 AND tag_id = $2 AND project_id = $3',
                    [nodeId, tagId, projId]
                );

                const retTaggedNode: ITaggedNode = selectTaggedNodeQuery.rows[0];
                
                return res.status(200).json(retTaggedNode);
            }
        }
        return res.status(401).json({error: 'failed to remove tagId from node'});
    });

export { router as tag };
