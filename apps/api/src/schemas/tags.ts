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

export type CreateTagSchemaType = z.infer<ReturnType<typeof createTagSchema>>;

export type EditTagSchemaType = z.infer<ReturnType<typeof editTagSchema>>;
