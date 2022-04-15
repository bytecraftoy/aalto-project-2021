import { getConfig } from './configs';
import { Pool, QueryConfig, QueryResultRow } from 'pg'; //PoolConfig was unused
import { migrate } from 'postgres-migrations';
import { logger } from './helper/logging';

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
        //console.log("Text: ", text)
        //console.log("Params: ", params)
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

    async turnOff() {
        const pool = await this.getPool();
        const w = await pool.off;
        return w;
    }

    async initDatabase() {
        const pool = await this.getPool();
        const client = await pool.connect();

        this._waiting = new Promise((resolve) => {
            logger.info({ message: 'Running migrations' });
            migrate({ client }, './migrations')
                .then(() => {
                    logger.info('Migrations finished');
                })
                .catch(async (e: Error) => {
                    logger.error({
                        message: 'Migrations failed, shutting down.\n',
                        error: e,
                    });

                    process.exit(1);
                })
                .finally(() => {
                    resolve();
                    this._waiting = null;
                });
        });
    }
}

const db = new Database();

db.initDatabase();

export { db };
