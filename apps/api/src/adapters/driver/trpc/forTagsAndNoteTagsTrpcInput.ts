import { z } from 'zod';

import { tagTypeEnum } from '@api/db/schema';

export const createTagSchema = () =>
  z.object({
    name: z.string(),
    type: z.enum(tagTypeEnum.enumValues),
  });

export const editTagSchema = () =>
  z.object({
    id: z.uuid(),
    name: z.string(),
  });

export const createNoteTagSchema = () =>
  z.intersection(
    z.object({
      name: z.string(),
      noteId: z.uuid(),
    }),
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('string') }),
      z.object({ type: z.literal('number'), value: z.number() }),
      z.object({ type: z.literal('date'), value: z.iso.date() }),
      z.object({ type: z.literal('boolean'), value: z.boolean() }),
    ]),
  );

export const deleteNoteTagSchema = () =>
  z.object({
    noteId: z.uuid(),
    tagId: z.uuid(),
  });

export const editNoteTagSchema = () =>
  z.object({
    noteId: z.uuid(),
    tagId: z.uuid(),
    value: z.union([z.string(), z.number(), z.iso.date(), z.boolean()]),
  });

export const findAllNoteTagsSchema = () =>
  z.object({
    noteId: z.uuid(),
  });

export type CreateTagSchemaType = z.infer<ReturnType<typeof createTagSchema>>;

export type EditTagSchemaType = z.infer<ReturnType<typeof editTagSchema>>;

export type CreateNoteTagSchemaType = z.infer<
  ReturnType<typeof createNoteTagSchema>
>;

export type DeleteNoteTagSchemaType = z.infer<
  ReturnType<typeof deleteNoteTagSchema>
>;

export type EditNoteTagSchemaType = z.infer<
  ReturnType<typeof editNoteTagSchema>
>;

export type FindAllNoteTagsSchemaType = z.infer<
  ReturnType<typeof findAllNoteTagsSchema>
>;
