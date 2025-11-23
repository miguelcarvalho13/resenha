import { z } from 'zod';

export const createNoteSchema = () =>
  z.object({
    content: z.string(),
  });

export const softDeleteNotesSchema = () =>
  z.object({
    noteIds: z.array(z.uuid()),
  });

export const editNoteSchema = () =>
  z.object({
    id: z.uuid(),
    content: z.string(),
  });

export type CreateNoteSchemaType = z.infer<ReturnType<typeof createNoteSchema>>;

export type SoftDeleteNotesSchemaType = z.infer<
  ReturnType<typeof softDeleteNotesSchema>
>;

export type EditNoteSchemaType = z.infer<ReturnType<typeof editNoteSchema>>;
