import { router } from '../router';
import { Request, Response } from 'express';
import { IEdge } from '../../../../types';
import { db } from '../../dbConfigs';

router
    .route('/edge/:source/:target')
    .delete(async (req: Request, res: Response) => {
        const source = req.params.source;
        const target = req.params.target;
        await db.query(
            'DELETE FROM edge WHERE source_id = $1 AND target_id = $2',
            [source, target]
        );
        res.status(200).json();
    });

router.route('/edge/:id').get(async (req: Request, res: Response) => {
    const project_id = req.params.id;
    const q = await db.query('SELECT * FROM edge WHERE project_id = $1', [
        project_id,
    ]);
    res.json(q.rows);
});

router
    .route('/edge')
    .post(async (req: Request, res: Response) => {
        const text: IEdge = req.body; //Might have to parse this

        try {
            const duplicateCheck = await db.query(
                'SELECT * FROM edge WHERE source_id = $1 AND target_id = $2',
                [text.source_id, text.target_id]
            );

            if (duplicateCheck.rowCount > 0) {
                res.status(403).json().end();
                return;
            }

            const reverseCheck = await db.query(
                'SELECT * FROM edge WHERE source_id = $1 AND target_id = $2',
                [text.target_id, text.source_id]
            );

            if (reverseCheck.rowCount > 0) {
                await db.query(
                    'DELETE FROM edge WHERE source_id = $1 AND target_id = $2',
                    [text.target_id, text.source_id]
                );
            }

            const edge = await db.query(
                'INSERT INTO edge (source_id, target_id, project_id) VALUES ($1, $2, $3)',
                [text.source_id, text.target_id, text.project_id]
            );
            res.status(200).json(edge);
        } catch (e) {
            console.log(e);
            res.status(403).json();
        }
    })
    .put((req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    })
    .delete(async (req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    });

export { router as edge };
