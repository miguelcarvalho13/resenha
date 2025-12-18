import { and, eq, isNull } from 'drizzle-orm';
import type { RequestHandler } from 'express';

import { db } from '@api/db';
import { invites } from '@api/db/schema';

/**
 * This is an express middleware that should handles invite codes before allowing the user to sign-up.
 * If the invite code feature is enabled, `inviteCode` param will be required in the request.
 */
export const handleInvitesMiddleware: RequestHandler = async (
  req,
  res,
  next,
) => {
  const enableInviteCodes =
    process.env.FEATURE_ENABLE_INVITES === '1' ||
    process.env.FEATURE_ENABLE_INVITES?.toLocaleLowerCase() === 'true';

  if (enableInviteCodes) {
    const inviteCode =
      'inviteCode' in req.body ? (req.body.inviteCode as string) : undefined;

    if (!inviteCode) {
      return res.status(400).json({
        message: 'Missing invite code.',
        success: false,
      });
    }

    const [selectedInvite] = await db
      .select()
      .from(invites)
      .where(and(eq(invites.code, inviteCode), isNull(invites.usedAt)));

    // If not valid invite was found, returns an error
    if (!selectedInvite) {
      return res.status(403).json({
        message: 'Invalid invite code.',
        success: false,
      });
    }

    // if the invite was not invalid, then it needs to be marked as used
    await db.update(invites).set({ usedAt: new Date() });
  }

  // Proceeds to the next handler if not early return was used.
  next();
};
