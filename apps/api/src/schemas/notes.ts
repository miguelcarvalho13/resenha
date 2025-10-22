import { z } from 'zod';

export const createNoteSchema = () =>
  z.object({
    content: z.string(),
  });

export const editNoteSchema = () =>
  z.object({
    id: z.string().uuid(),
    content: z.string(),
  });

export type CreateNoteSchemaType = z.infer<ReturnType<typeof createNoteSchema>>;

export type EditNoteSchemaType = z.infer<ReturnType<typeof editNoteSchema>>;
