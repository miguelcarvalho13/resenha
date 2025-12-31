import { searchContentSchema } from '@api/domain/entities/searches';
import { z } from 'zod';

export const searchNotesSchema = () => z.object(searchContentSchema().shape);

export const createSearchSchema = () =>
  z.object({
    content: searchNotesSchema(),
  });

export const hardDeleteSearchesSchema = () =>
  z.object({
    searchIds: z.array(z.uuid()),
  });

export const softDeleteSearchesSchema = () =>
  z.object({
    searchIds: z.array(z.uuid()),
  });

export const undoSoftDeletedSearchesSchema = () =>
  z.object({
    searchIds: z.array(z.uuid()),
  });

export const editSearchSchema = () =>
  z.object({
    content: z.object({ ...searchNotesSchema().shape }).optional(),
    favorited: z.boolean().optional(),
    id: z.uuid(),
    name: z.string().optional(),
  });

export const findSearchByIdSchema = () =>
  z.object({
    searchId: z.uuid(),
  });

export type SearchNotesSchemaType = z.infer<
  ReturnType<typeof searchNotesSchema>
>;

export type CreateSearchSchemaType = z.infer<
  ReturnType<typeof createSearchSchema>
>;

export type HardDeleteSearchesSchemaType = z.infer<
  ReturnType<typeof hardDeleteSearchesSchema>
>;

export type SoftDeleteSearchesSchemaType = z.infer<
  ReturnType<typeof softDeleteSearchesSchema>
>;

export type UndoSoftDeletedSearchesSchemaType = z.infer<
  ReturnType<typeof undoSoftDeletedSearchesSchema>
>;

export type EditSearchSchemaType = z.infer<ReturnType<typeof editSearchSchema>>;
export type FindSearchByIdSchemaType = z.infer<
  ReturnType<typeof findSearchByIdSchema>
>;
