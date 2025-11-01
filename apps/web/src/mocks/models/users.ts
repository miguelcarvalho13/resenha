import { Collection } from '@msw/data';
import { type User } from 'better-auth';
import z from 'zod';

export const userMockSchema = z.object({
  createdAt: z.date(),
  email: z.email(),
  emailVerified: z.boolean(),
  id: z.string(),
  image: z.url().optional().nullable(),
  name: z.string(),
  updatedAt: z.date(),
}) satisfies z.ZodType<User>;

export const userMock = new Collection({ schema: userMockSchema });

export type UserMockSchemaType = z.infer<typeof userMockSchema>;
