import { router } from '../router';
import { Request, Response } from 'express';
import { ITag, ITaggedNode } from '../../../../types';
import { db } from '../../dbConfigs';
import {
    checkProjectPermissionByProjectId,
} from '../../helper/permissionHelper';

router
    .route('/tag/:proj')
    .get(async (req: Request, res: Response) => {
        const projId = parseInt(req.params.proj);

        const view = await checkProjectPermissionByProjectId(req, projId);

        if (!projId || !view) {
            return res.status(401).json({ message: 'No permission' });
        }

        const projTagsQuery = await db.query(
            'SELECT * FROM tag WHERE project_id = $1',
            [projId]
        );

        const projTaggedNodesQuery = await db.query(
            'SELECT * FROM tagged_nodes WHERE project_id = $1',
            [projId]
        );

        const projTags = projTagsQuery.rows;
        const projTagged = projTaggedNodesQuery.rows;

        res.json({
            tags: projTags,
            tagged_nodes: projTagged 
        });
    });

router
    .route('/tag/:proj/:node')
    .post(async (req: Request, res: Response) => {
        const projId = parseInt(req.params.proj);
        const nodeId = parseInt(req.params.node);

        const view = await checkProjectPermissionByProjectId(req, projId);
    
        if (!projId || !view) {
            return res.status(401).json({ message: 'No permission' });
        }

        let tag: ITag | null = req.body.tag;
        if (!tag) {
            req.logger.info({
                message: 'Creating tag to node',
                projectId: projId,
                nodeId: nodeId,
                body: req.body,
            });

            const label: string | null = req.body.label;
            let tagColor: string | null = req.body.tag_color;
            if (label) {
                if (!tagColor) {
                    tagColor = 'red';
                }

                const insertTagQuery = await db.query(
                    'INSERT INTO tag (label, color, project_id) VALUES ($1, $2, $3) RETURNING id, label, color, project_id',
                    [label, tagColor, projId]
                );
            
                if (insertTagQuery.rowCount == 1) {
                    tag = insertTagQuery.rows[0];
                }
            }
        }

        if (tag) {
            req.logger.info({
                message: 'Adding tag to node',
                projectId: projId,
                label: tag.label,
            });

            const tagId = tag.id;

            if (projId && nodeId && tagId) {
                const insertTaggedNodeQuery = await db.query(
                    'INSERT INTO tagged_nodes (node_id, tag_id, project_id) VALUES ($1, $2, $3)',
                    [nodeId, tagId, projId]
                );

                if (insertTaggedNodeQuery.rowCount == 1) {
                    const retTaggedNode: ITaggedNode = insertTaggedNodeQuery.rows[0];
                    if (retTaggedNode) {
                        return res.status(200).json({
                            tag: tag,
                            tagged_node: retTaggedNode
                        });
                    }
                }
            }
        }

        res.status(401).json({ error: 'failed to add tag to node' });
    });

router
    .route('/tag/:proj/:node/:tag')
    .delete(async (req: Request, res: Response) => {
        const projId = parseInt(req.params.proj);
        const nodeId = parseInt(req.params.node);
        const tagId = parseInt(req.params.tag);

        const { edit, projectId } = await checkProjectPermissionByProjectId(
            req,
            projId
        );

        if (!projectId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }

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

                const retTaggedNode: ITaggedNode =
                    selectTaggedNodeQuery.rows[0];

                return res.status(200).json(retTaggedNode);
            }
        }
        return res.status(401).json({ error: 'failed to remove tag from node' });
    });

router
    .route('/tag2/:proj/:tag')
    .put(async (req: Request, res: Response) => {
        const projId = parseInt(req.params.proj);
        const tagId = parseInt(req.params.tag);
    
        const edit = await checkProjectPermissionByProjectId(req, projId);
        
        if (!projId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }
    
        req.logger.info({
            message: 'Updating tag',
            projectId: projId,
            tagId: tagId,
        });
    
        const tag: ITag | null = req.body.tag;
    
        if (tag) {
            const q = await db.query(
                'UPDATE tag SET label = $1, color = $2 WHERE id = $3 AND project_id = $4',
                [tag.label, tag.color, tag.id, projId]
            );
            res.status(200).json(q);
        }
    
        res.status(401).json({ error: 'failed to update tag' });
    
    })
    .delete(async (req: Request, res: Response) => {
        const projId = parseInt(req.params.proj);
        const tagId = parseInt(req.params.tag);
    
        const edit = await checkProjectPermissionByProjectId(req, projId);

        if (!projId || !edit) {
            return res.status(401).json({ message: 'No permission' });
        }
    
        req.logger.info({
            message: 'Deleting tag',
            projectId: projId,
            tagId: tagId,
        });
    
        const q = await db.query(
            'DELETE FROM tag WHERE id = $1 AND project_id = $2',
            [tagId, projId]
        );
        res.status(200).json(q);
    });

export { router as tag };
