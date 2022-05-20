import { IConfigs } from './domain/IConfigs';

const configs: IConfigs = {
    poolConfig: {
        host: String(process.env.PG_HOSTNAME || 'localhost'),
        port: Number(process.env.PG_PORT) || 5432,
        user: String(process.env.PG_USER || 'postgres'),
        database: String(process.env.PG_DATABASE || 'postgres'),
        password: String(process.env.PG_PASSWORD || 'example'),
    },
};

export async function getConfig(): Promise<IConfigs> {
    return configs;
}
