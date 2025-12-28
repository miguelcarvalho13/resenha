import { Collection } from '@msw/data';
import z from 'zod';

import { type NoteTag, type Tag } from '@/models/tags';
import { noteMock, noteMockSchema } from './notes';
import { userMock, userMockSchema } from './users';

export const tagMockSchema = z.object({
  createdAt: z.date(),
  createdBy: z.uuid(),
  get createdByUser() {
    return userMockSchema.optional();
  },
  id: z.uuid(),
  name: z.string(),
  type: z.union([
    z.literal('boolean'),
    z.literal('date'),
    z.literal('number'),
    z.literal('string'),
  ]),
  updatedAt: z.date(),
  updatedBy: z.uuid(),
  get updatedByUser() {
    return userMockSchema.optional();
  },
}) satisfies z.ZodType<Tag>;

export const noteTagMockSchema = z.intersection(
  z.object({
    createdAt: z.date(),
    createdBy: z.uuid(),
    get createdByUser() {
      return userMockSchema.optional();
    },
    name: z.string(),
    get note() {
      return noteMockSchema.optional();
    },
    noteId: z.uuid(),
    get tag() {
      return tagMockSchema.optional();
    },
    tagId: z.uuid(),
    updatedAt: z.date(),
    updatedBy: z.uuid(),
    get updatedByUser() {
      return userMockSchema.optional();
    },
  }),
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('string'), value: z.string() }),
    z.object({ type: z.literal('number'), value: z.number() }),
    z.object({ type: z.literal('date'), value: z.iso.date() }),
    z.object({ type: z.literal('boolean'), value: z.boolean() }),
  ]),
) satisfies z.ZodType<NoteTag>;

export const tagMock = new Collection({ schema: tagMockSchema });
export const noteTagMock = new Collection({ schema: noteTagMockSchema });
export type TagMockSchemaType = z.infer<typeof tagMockSchema>;
export type NoteTagMockSchemaType = z.infer<typeof noteTagMockSchema>;

tagMock.defineRelations(({ one }) => ({
  createdByUser: one(userMock),
  updatedByUser: one(userMock),
}));

noteTagMock.defineRelations(({ one }) => ({
  note: one(noteMock),
  tag: one(tagMock),
  createdByUser: one(userMock),
  updatedByUser: one(userMock),
}));
