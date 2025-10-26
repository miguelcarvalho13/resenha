import { z } from 'zod';

import { tagTypeEnum } from '@api/db/schema';

export const createTagSchema = () =>
  z.object({
    name: z.string(),
    type: z.enum(tagTypeEnum.enumValues),
  });

export const editTagSchema = () =>
  z.object({
    id: z.string().uuid(),
    name: z.string(),
  });

export const createNoteTagSchema = () =>
  z.intersection(
    z.object({
      name: z.string(),
      noteId: z.string().uuid(),
    }),
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('string') }),
      z.object({ type: z.literal('number'), value: z.number() }),
      z.object({ type: z.literal('date'), value: z.string().date() }),
      z.object({ type: z.literal('boolean'), value: z.boolean() }),
    ]),
  );

export const editNoteTagSchema = () =>
  z.object({
    noteId: z.string().uuid(),
    tagId: z.string().uuid(),
    value: z.union([z.string(), z.number(), z.string().date(), z.boolean()]),
  });

export const findAllNoteTagsSchema = () =>
  z.object({
    noteId: z.string().uuid(),
  });

export type CreateTagSchemaType = z.infer<ReturnType<typeof createTagSchema>>;

export type EditTagSchemaType = z.infer<ReturnType<typeof editTagSchema>>;

export type CreateNoteTagSchemaType = z.infer<
  ReturnType<typeof createNoteTagSchema>
>;

export type EditNoteTagSchemaType = z.infer<
  ReturnType<typeof editNoteTagSchema>
>;

export type FindAllNoteTagsSchemaType = z.infer<
  ReturnType<typeof findAllNoteTagsSchema>
>;
