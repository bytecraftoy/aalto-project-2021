import { requestLogger } from './logger';
import { checkMethod } from './checkMethod';
import { tokenExtractor } from './tokenExtractor';
import { userExtractor } from './userExtractor';
import { addRequestId } from './addRequestId';

// The order of middlewares matter.
export const middlewares = [
    addRequestId,
    checkMethod,
    requestLogger,
    tokenExtractor,
    userExtractor,
];
