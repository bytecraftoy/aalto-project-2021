import { createLogger, format, transports } from 'winston';

const logFormatProd = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

const logFormatDev = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint()
);

export const logger = createLogger({
    level: 'info',
    format:
        process.env.NODE_ENV === 'development' ? logFormatDev : logFormatProd,
    transports: [new transports.Console()],
});
