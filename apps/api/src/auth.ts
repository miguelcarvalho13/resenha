import { betterAuth } from 'better-auth';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { inviteCodePlugin } from '@api/utils/authPlugins/inviteCodePlugin';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const createAuth = ({
  enableEmailSignup,
  enableInviteCodes,
}: {
  enableEmailSignup: boolean;
  enableInviteCodes: boolean;
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
    plugins: enableInviteCodes ? [inviteCodePlugin()] : undefined,
  });

export type AuthType = ReturnType<typeof createAuth>;
