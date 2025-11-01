import { Collection } from '@msw/data';
import { type Session } from 'better-auth';
import z from 'zod';

import { userMock, userMockSchema } from './users';

export const sessionMockSchema = z.object({
  createdAt: z.date(),
  expiresAt: z.date(),
  id: z.string(),
  ipAddress: z.ipv4().optional().nullable(),
  token: z.string(),
  updatedAt: z.date(),
  get user() {
    return userMockSchema;
  },
  userAgent: z.string().optional().nullable(),
  userId: z.string(),
}) satisfies z.ZodType<Session>;

export const sessionMock = new Collection({ schema: sessionMockSchema });

sessionMock.defineRelations(({ one }) => ({
  user: one(userMock),
}));

export type SessionMockSchemaType = z.infer<typeof sessionMockSchema>;
