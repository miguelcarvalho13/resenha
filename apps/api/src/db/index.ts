import 'dotenv/config';
import * as schema from '@api/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL && !process.env.VITEST) {
  throw new Error(
    'DATABASE_URL environment variable not set. Please set one in the /apps/api/.env file.',
  );
}

export const db = drizzle(process.env.DATABASE_URL, { schema });

export type DatabaseType = typeof db;
export type TransactionType = Parameters<
  Parameters<DatabaseType['transaction']>[0]
>[0];
