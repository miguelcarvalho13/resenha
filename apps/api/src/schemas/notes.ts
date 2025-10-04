import { z } from 'zod';

export const createNotesSchema = () =>
  z.object({
    content: z.string(),
  });

export type CreateNotesSchemaType = z.infer<
  ReturnType<typeof createNotesSchema>
>;
