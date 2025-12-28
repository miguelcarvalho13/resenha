import { z } from 'zod';
import { TAG_TYPES } from './tagTypes';

export const noteTagSchema = () =>
  z.intersection(
    z.object({
      createdAt: z.date(),
      createdBy: z.uuid(),
      name: z.string(),
      noteId: z.uuid(),
      tagId: z.uuid(),
      updatedAt: z.date(),
      updatedBy: z.uuid(),
    }),
    z.discriminatedUnion('type', [
      z.object({ type: z.literal(TAG_TYPES.STRING), value: z.string() }),
      z.object({ type: z.literal(TAG_TYPES.NUMBER), value: z.number() }),
      z.object({ type: z.literal(TAG_TYPES.DATE), value: z.iso.date() }),
      z.object({ type: z.literal(TAG_TYPES.BOOLEAN), value: z.boolean() }),
    ]),
  );

export type NoteTag = z.infer<ReturnType<typeof noteTagSchema>>;
