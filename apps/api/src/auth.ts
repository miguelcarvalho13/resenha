import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import type { GlobalConfig } from '@api/domain/entities/globalConfig';
import { inviteCodePlugin } from '@api/utils/authPlugins/inviteCodePlugin';

export const createAuth = ({
  isEmailSignupEnabled,
  isInviteCodesEnabled,
}: GlobalConfig) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: isEmailSignupEnabled,
    },
    trustedOrigins: [process.env.WEB_APP_URL ?? ''],
    plugins: isInviteCodesEnabled ? [inviteCodePlugin()] : undefined,
  });

export type AuthType = ReturnType<typeof createAuth>;
