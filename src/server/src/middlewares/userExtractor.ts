import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const userExtractor = (
    req: Request,
    res: Response,
    next: (param?: unknown) => void
) => {
    if (req.token) {
        req.user = jwt.verify(req.token, process.env.SECRET || 'secret') as {
            email: string;
            id: number;
            iat: number;
        };
    }
    next();
};
