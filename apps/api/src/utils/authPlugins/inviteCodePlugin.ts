import { APIError } from 'better-auth';
import {
  type BetterAuthPlugin,
  createAuthMiddleware,
} from 'better-auth/plugins';
import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@api/db';
import { invites } from '@api/db/schema';

export const inviteCodePlugin = () =>
  ({
    id: 'invite-code-plugin',
    hooks: {
      before: [
        {
          matcher: (context) => context.path.includes('/sign-up'),
          handler: createAuthMiddleware(async (ctx) => {
            const inviteCode =
              'inviteCode' in ctx.body
                ? (ctx.body.inviteCode as string)
                : undefined;

            if (!inviteCode) {
              throw new APIError('BAD_REQUEST', {
                message: 'Missing invite code.',
              });
            }

            const [selectedInvite] = await db
              .select()
              .from(invites)
              .where(and(eq(invites.code, inviteCode), isNull(invites.usedAt)));

            // If no valid invite is found (that weren't already used), returns an error
            if (!selectedInvite) {
              throw new APIError('FORBIDDEN', {
                message: 'Invalid invite code.',
              });
            }
          }),
        },
      ],
      after: [
        {
          matcher: (context) => context.path.includes('/sign-up'),
          handler: createAuthMiddleware(async (ctx) => {
            // if user was created, then we mark the invite code as used
            if (ctx.context.newSession?.user.id) {
              await db
                .update(invites)
                .set({ usedAt: new Date() })
                .where(eq(invites.code, ctx.body.inviteCode! as string));
            }
          }),
        },
      ],
    },
  }) satisfies BetterAuthPlugin;
