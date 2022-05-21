import winston from 'winston';

declare global {
    declare namespace Express {
        export interface Request {
            token?: string;
            user?: { email: string; id: number; iat: number };
            logger: winston.Logger;
        }
    }
}