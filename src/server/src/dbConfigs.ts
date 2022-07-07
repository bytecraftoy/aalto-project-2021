import { getConfig } from './configs';
import { Pool, QueryConfig, QueryResultRow } from 'pg';
import { migrate } from 'postgres-migrations';
import { logger } from './helper/logging';
import { doClean } from './db/cleaner';

    let cleaning = false;
export class Database {
    private _pool: Pool | null = null;
    private _waiting: Promise<void> | null = null;

    //Below comment will remove the eslint error, but maybe it should be
    //handled in another way. Need to find at a later time whether it can be given a type.

    //eslint-disable-next-line @typescript-eslint/no-explicit-any -- /* eslint-disable ... */
    async query<R extends QueryResultRow = any, I extends any[] = any[]>(
        text: string | QueryConfig<any>,
        params?: unknown[]
    ) {
        if (this._waiting) {
            await this._waiting;
        }

        const start = Date.now();
        const pool = await this.getPool();
        const res = await pool.query<R, I>(text, params as any);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            logger.debug({
                message: 'Executed query',
                text,
                duration,
                rows: res.rowCount,
            });
        }
        return res;
    }

    async getClient() {
        if (this._waiting) {
            await this._waiting;
        }

        const pool = await this.getPool();
        const client = await pool.connect();
        return client;
    }
    async getPool(): Promise<Pool> {
        if (!this._pool) {
            const config = await getConfig();
            this._pool = new Pool(config.poolConfig);
        }
        return this._pool;
    }

    async initDatabase() {
        const client = await this.getClient();

        let res: () => void = () => {};
        let rej: (e: unknown) => void = () => {};

        this._waiting = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject;
        });

        logger.info({ message: 'Running migrations' });
        try {
            await migrate({ client }, './migrations');
            logger.info('Migrations finished');
            res();
        } catch (e: unknown) {
            logger.error({
                message: 'Migrations failed, shutting down.\n',
                error: e,
            });

            rej(e);
            throw e;
        } finally {
            client.release();
            this._waiting = null;
        }

        return this._waiting;
    }

    async clean(reason: string) {
        logger.info({message: 'Starting database cleanup', reason});
        if(cleaning) {
            throw "Concurrent access to clean";
        }
        try {
            cleaning = true;
            logger.info('Cleaning database');
            const client = await this.getClient();
            try {
                await doClean(client);
            } catch(e) {
                console.log(e);
                throw(e);
            } finally {
                client.release();
            }
            logger.info('Database cleaned, running migrations');
            await this.initDatabase();
            logger.info('Migrations done');
        } finally {
            cleaning = false;
        }
    }
}

const db = new Database();

export { db };
