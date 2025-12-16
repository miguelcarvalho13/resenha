import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@api/db';
import * as schema from '@api/db/schema';

export const createAuth = ({
  enableEmailSignup,
}: {
  enableEmailSignup: boolean;
}) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: enableEmailSignup,
    },
    trustedOrigins: [process.env.WEB_APP_URL ?? ''],
  });

export type AuthType = ReturnType<typeof createAuth>;
