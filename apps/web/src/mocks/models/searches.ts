import { Collection } from '@msw/data';
import z from 'zod';

import { userMock, userMockSchema } from './users';
import { type Search } from '@/models/searches';
import { searchNotesSchema } from '@repo/api';

export const searchMockSchema = z.object({
  content: z.object({ query: searchNotesSchema().shape.query }),
  createdAt: z.date(),
  createdBy: z.uuid(),
  deletedAt: z.date().nullable(),
  deletedBy: z.uuid().nullable(),
  favorited: z.boolean(),
  get createdByUser() {
    return userMockSchema.optional();
  },
  get deletedByUser() {
    return userMockSchema.optional();
  },
  get updatedByUser() {
    return userMockSchema.optional();
  },
  id: z.uuid(),
  name: z.string().nullable(),
  updatedAt: z.date(),
  updatedBy: z.uuid(),
}) satisfies z.ZodType<Search>;

export const searchMock = new Collection({ schema: searchMockSchema });

searchMock.defineRelations(({ one }) => ({
  createdByUser: one(userMock),
  deletedByUser: one(userMock),
  updatedByUser: one(userMock),
}));

export type SearchMockSchemaType = z.infer<typeof searchMockSchema>;
