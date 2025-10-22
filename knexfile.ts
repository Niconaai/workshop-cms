import dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config({ path: '.env' });

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            tableName: 'knex_migrations',
            directory: './db/migrations'
        }
    }
}

export default config;