import { requestLogger } from './logger';
import { tokenExtractor } from './tokenExtractor';
import { userExtractor } from './userExtractor';
import { addRequestId } from './addRequestId';

// The order of middlewares matter.
export const middlewares = [
    addRequestId,
    requestLogger,
    tokenExtractor,
    userExtractor,
];
