import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable not set. Please set one in the /apps/api/.env file.',
  );
}

export const db = drizzle(process.env.DATABASE_URL);
