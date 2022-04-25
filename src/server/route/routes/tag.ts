import { router } from '../router';
import { Request, Response } from 'express';
import { ITag } from '../../../../types';
import { db } from '../../dbConfigs';
import {
    checkProjectPermissionByProjectId,
    checkProjectPermissionByTagId,
} from '../../helper/permissionHelper';

router.route('/tag/proj/:proj').get(async (req: Request, res: Response) => {
    const { view, projectId } = await checkProjectPermissionByProjectId(
        req,
        parseInt(req.params.proj)
    );

    if (!projectId || !view) {
        return res.status(401).json({ message: 'No permission' });
    }

    const q = await db.query('SELECT * FROM tag WHERE project_id = $1', [
        projectId,
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

        try {
            req.logger.info({
                message: 'Adding tag to node',
                projectId,
                label: tag.label,
            });

            const q = await db.query(
                'INSERT INTO tag (label, color, project_id) VALUES ($1, $2, $3) RETURNING id',
                [tag.label, tag.color, projectId]
            );
            res.status(200).json(q);
        } catch (e) {
            // Invalid tag
            res.status(403).json();
        }
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

export { router as tag };
