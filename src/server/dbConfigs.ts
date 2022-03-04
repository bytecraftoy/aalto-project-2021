import { getConfig } from './configs';
import { Pool, QueryConfig } from 'pg'; //PoolConfig was unused
import { migrate } from 'postgres-migrations';

export class Database {
    private _pool: Pool | null = null;
    private _waiting: Promise<void> | null = null;

    //Below comment will remove the eslint error, but maybe it should be
    //handled in another way. Need to find at a later time whether it can be given a type.

    //eslint-disable-next-line @typescript-eslint/no-explicit-any -- /* eslint-disable ... */
    async query(text: string | QueryConfig<any>, params?: unknown[]) {
        if (this._waiting) {
            await this._waiting;
        }

        const start = Date.now();
        //console.log("Text: ", text)
        //console.log("Params: ", params)
        const pool = await this.getPool();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV !== 'test') {
            console.log('executed query', {
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
            if (process.env.NODE_ENV !== 'test') {
                console.log('running migrations');
            }
            migrate({ client }, './migrations')
                .then(() => {
                    if (process.env.NODE_ENV !== 'test') {
                        console.log('migrations done');
                    }
                })
                .catch(async (e: Error) => {
                    console.error('Migrations failed, shutting down.\n', e);

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

if (process.env.NODE_ENV !== 'production') {
    db.initDatabase();
}

export { db };
