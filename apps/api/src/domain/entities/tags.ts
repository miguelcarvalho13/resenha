import { z } from 'zod';
import { ALL_TAG_TYPES } from './tagTypes';

export const tagSchema = () =>
  z.object({
    id: z.uuid(),
    createdAt: z.date(),
    createdBy: z.uuid(),
    name: z.string(),
    type: z.enum(ALL_TAG_TYPES),
    updatedAt: z.date(),
    updatedBy: z.uuid(),
  });

export type Tag = z.infer<ReturnType<typeof tagSchema>>;
