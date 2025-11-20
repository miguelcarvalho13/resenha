import { Button, Group, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { TbPlus } from 'react-icons/tb';

import {
  SearchModalFormProvider,
  searchModalSchema,
  type SearchModalSchemaType,
  useSearchModalForm,
} from './SearchNotesModal.form';
import { SearchNotesModalRow } from './SearchNotesModalRow';

interface SearchNotesModalProps {
  initialValues: SearchModalSchemaType;
  onSubmit: (values: SearchModalSchemaType) => void;
}

export const SearchNotesModal = ({
  initialValues,
  onSubmit,
}: SearchNotesModalProps) => {
  const { t } = useTranslation();

  const form = useSearchModalForm({
    mode: 'uncontrolled',
    initialValues,

    validate: zod4Resolver(searchModalSchema),
  });

  const rows = form.getValues().query;

  const handleSubmit = (values: SearchModalSchemaType) => {
    onSubmit(values);
    modals.closeAll();
  };

  const handleAddTag = () => {
    form.insertListItem('query', { tagId: null, operator: '=' });
  };

  return (
    <SearchModalFormProvider form={form}>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack align="center" c="dimmed" gap="lg">
          <Text size="xs" ta="left" w="100%">
            {t(($) => $.search.modal.description)}
          </Text>

          <Stack data-testid="tags-filter-container" gap={0} w="100%">
            {rows?.map((_, index) => (
              <SearchNotesModalRow key={index} index={index} />
            ))}
          </Stack>

          <Button
            leftSection={<TbPlus />}
            onClick={handleAddTag}
            variant="outline"
          >
            {t(($) => $.search.modal.addTag)}
          </Button>
        </Stack>

        <Group mt="xl" justify="right">
          <Button type="submit">{t(($) => $.common.search)}</Button>
        </Group>
      </form>
    </SearchModalFormProvider>
  );
};
