import { Request, Response } from 'express';

export const requestLogger = (
    req: Request,
    res: Response,
    next: (param?: unknown) => void
): void => {
    let body = req.body;

    if (body.password) {
        body = { ...body, password: '' };
    }

    const method = req.method;
    const url = `${req.baseUrl}${req.url}`;

    if (process.env.NODE_ENV === 'development') {
        req.logger.info({ message: 'Request', method, url, body });
    } else {
        req.logger.info({ message: 'Request', method, url });
    }

    res.on('finish', () => {
        if (process.env.NODE_ENV === 'development') {
            req.logger.info({
                message: 'Response',
                method,
                url,
                status: res.statusCode,
                body,
            });
        } else {
            req.logger.info({
                message: 'Response',
                method,
                url,
                status: res.statusCode,
            });
        }
    });

    next();
};
