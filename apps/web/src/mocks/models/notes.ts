import { Collection } from '@msw/data';
import z from 'zod';

import { type NoteForFindAll } from '@/models/notes';
import { userMock, userMockSchema } from './users';

export const noteMockSchema = z.object({
  content: z.string(),
  createdAt: z.date(),
  createdBy: z.uuid(),
  get createdByUser() {
    return userMockSchema.optional();
  },
  id: z.uuid(),
  updatedAt: z.date(),
}) satisfies z.ZodType<NoteForFindAll>;

export const noteMock = new Collection({ schema: noteMockSchema });

noteMock.defineRelations(({ one }) => ({
  createdByUser: one(userMock),
}));

export type NoteMockSchemaType = z.infer<typeof noteMockSchema>;
