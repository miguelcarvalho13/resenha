import { createFormContext } from '@mantine/form';
import z from 'zod';

export const searchModalSchema = z.object({
  query: z.array(
    z.object({
      tagId: z.uuid(),
      operator: z.enum(['<', '<=', '=', '>', '>=']).nullish(),
      value: z.union([z.string(), z.iso.date(), z.number()]).nullish(),
    }),
  ),
});

export type SearchModalSchemaType = z.infer<typeof searchModalSchema>;

export const [
  SearchModalFormProvider,
  useSearchModalFormContext,
  useSearchModalForm,
] = createFormContext<SearchModalSchemaType>();
