import { z } from 'zod';

export const noteSchema = () =>
  z.object({
    id: z.uuid(),
    content: z.string(),
    createdAt: z.date(),
    createdBy: z.uuid(),
    deletedAt: z.date().nullable(),
    deletedBy: z.uuid().nullable(),
    updatedAt: z.date(),
    updatedBy: z.uuid(),
  });

export type Note = z.infer<ReturnType<typeof noteSchema>>;
