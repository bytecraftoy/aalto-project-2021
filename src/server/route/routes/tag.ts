import { router } from '../router';
import { Request, Response } from 'express';
import { ITag } from '../../../../types';
import { db } from '../../dbConfigs';

router.route('/tag/proj/:proj').get(async (req: Request, res: Response) => {
    const proj_id = req.params.proj;

    const q = await db.query('SELECT * FROM tag WHERE project_id = $1', [
        proj_id,
    ]);
    res.json(q.rows);
});

router
    .route('/tag')
    .get(async (req: Request, res: Response) => {
        const q = await db.query('SELECT * FROM tag', []);
        res.json(q.rows);
    })
    .post(async (req: Request, res: Response) => {
        const tag: ITag = req.body;

        try {
            const q = await db.query(
                // ignores tag.id when inserting into table
                'INSERT INTO tag (label, color, project_id) VALUES ($1, $2, $3) RETURNING id',
                [tag.label, tag.color, tag.project_id]
            );
            res.status(200).json(q);
        } catch (e) {
            // Invalid tag
            res.status(403).json();
        }
    })
    .put(async (req: Request, res: Response) => {
        const t: ITag = req.body;
        const q = await db.query(
            'UPDATE tag SET label = $1, color = $2 WHERE id = $3 AND project_id = $4',
            [t.label, t.color, t.id, t.project_id]
        );
        res.status(200).json(q);
    })
    .delete(async (req: Request, res: Response) => {
        const t: ITag = req.body;
        const q = await db.query(
            'DELETE FROM tag WHERE id = $1 AND project_id = $2',
            [t.id, t.project_id]
        );
        res.status(200).json(q);
    });

export { router as tag };
