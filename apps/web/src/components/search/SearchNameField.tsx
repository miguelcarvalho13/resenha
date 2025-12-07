import { TextInput, type TextInputProps } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import z from 'zod';

import { type Search } from '@/models/searches';
import { useTRPC } from '@/utils/trpc';

interface SearchNameFieldProps
  extends Omit<TextInputProps, 'aria-label' | 'variant' | 'placeholder'> {
  search: Search;
}

const searchNameSchema = z.object({
  name: z.string(),
});

type SearchNameSchemaType = z.infer<typeof searchNameSchema>;

export const SearchNameField = ({ search, ...props }: SearchNameFieldProps) => {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: editSearch, isPending } = useMutation(
    trpc.searches.editSearch.mutationOptions(),
  );

  const onSuccess = () => {
    void queryClient.invalidateQueries(
      trpc.searches.findAllSearches.pathFilter(),
    );
  };

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: search.name || '',
    },

    validate: zod4Resolver(searchNameSchema),
  });

  const handleSubmit = ({ name }: SearchNameSchemaType) => {
    if (name === search.name) return;

    return editSearch({ id: search.id, name }, { onSuccess });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        aria-label={t(($) => $.search.searchName)}
        placeholder={t(($) => $.common.untitled)}
        disabled={isPending}
        variant="unstyled"
        {...form.getInputProps('name')}
        onBlur={(e) => {
          form.getInputProps('name').onBlur(e);
          form.onSubmit(handleSubmit)();
        }}
        {...props}
      />
    </form>
  );
};
