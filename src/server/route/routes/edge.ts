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

router
    .route('/edge')
    .get(async (req: Request, res: Response) => {
        const q = await db.query('SELECT * FROM edge', []);

        res.json(q.rows);
    })
    .post(async (req: Request, res: Response) => {
        console.log('Receiving edge...', req.body);
        const text: IEdge = req.body; //Might have to parse this

        try {
            const q1 = await db.query(
                'SELECT * FROM edge WHERE source_id = $1 AND target_id = $2',
                [text.target_id, text.source_id]
            );

            if (q1.rowCount > 0) {
                await db.query(
                    'DELETE FROM edge WHERE source_id = $1 AND target_id = $2',
                    [text.target_id, text.source_id]
                );
            }

            const q3 = await db.query(
                'INSERT INTO edge (source_id, target_id) VALUES ($1, $2)',
                [text.source_id, text.target_id]
            );
            res.status(200).json(q3);
        } catch (e) {
            console.log(e);
            res.status(403).json();
        }

        const duplicateCheck = await db.query(
            'SELECT * FROM edge WHERE source_id = $1 AND target_id = $2',
            [text.source_id, text.target_id]
        );

        if (duplicateCheck.rowCount > 0) {
            res.status(403).json().end();
            return;
        }

        const q = await db.query(
            'INSERT INTO edge (source_id, target_id) VALUES ($1, $2)',
            [text.source_id, text.target_id]
        );
        res.status(200).json(q);
    })
    .put((req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    })
    .delete(async (req: Request, res: Response) => {
        res.status(501).json({ message: 'Not implemented' });
    });

export { router as edge };
