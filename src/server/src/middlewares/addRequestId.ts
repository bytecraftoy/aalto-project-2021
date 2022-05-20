import { Request, Response } from 'express';
import { logger } from '../helper/logging';
import { v4 as uuidv4 } from 'uuid';

let devReqIdSeq = 1;

export const addRequestId = (
    req: Request,
    res: Response,
    next: (param?: unknown) => void
): void => {
    let reqId;
    if (process.env.NODE_ENV === 'production') {
        reqId = req.headers['X-Request-ID'] || uuidv4();
    } else {
        reqId = devReqIdSeq++;
    }
    req.logger = logger.child({ reqId });

    next();
};
