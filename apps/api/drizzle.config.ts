import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL && !process.env.VITEST) {
  throw new Error(
    'DATABASE_URL environment variable not set. Please set one in the /apps/api/.env file.',
  );
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
