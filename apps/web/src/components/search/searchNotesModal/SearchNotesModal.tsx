import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { TbPlus } from 'react-icons/tb';

import { Route as RouteIndex } from '@/routes/index';
import {
  SearchModalFormProvider,
  searchModalSchema,
  type SearchModalSchemaType,
  useSearchModalForm,
} from './SearchNotesModal.form';
import { SearchNotesModalRow } from './SearchNotesModalRow';
import { trpc } from '@/utils/trpc';
import { type SearchNotesSchemaType } from '@repo/api';
import { YES_OPTION_VALUE } from '@/models/tags';

interface SearchNotesModalProps {
  close: () => void;
  opened: boolean;
}

export const SearchNotesModal = ({ close, opened }: SearchNotesModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: RouteIndex.fullPath });
  const { data: tagsData } = trpc.tags.findAllTags.useQuery();

  const form = useSearchModalForm({
    mode: 'uncontrolled',
    initialValues: { query: [] },

    validate: zod4Resolver(searchModalSchema),
  });

  const rows = form.getValues().query;

  const handleSubmit = (values: SearchModalSchemaType) => {
    const query: SearchNotesSchemaType['query'] = values.query.map(
      ({ tagId, operator, value }) => {
        const tag = tagsData?.tags.find(({ id }) => id === tagId);

        if (!tag) {
          throw new Error('Selected tag not found');
        }

        switch (tag.type) {
          case 'string':
            return { tagId, type: tag.type, operator: { type: '=' } };
          case 'number':
            if (!operator || typeof value !== 'number') {
              throw new Error('Unreachable case');
            }

            return {
              tagId,
              type: tag.type,
              operator: { type: operator, value },
            };
          case 'date':
            if (!operator || typeof value !== 'string') {
              throw new Error('Unreachable case');
            }

            return {
              tagId,
              type: tag.type,
              operator: { type: operator, value },
            };
          case 'boolean':
            if (operator !== '=') {
              throw new Error('Unreachable case');
            }

            return {
              tagId,
              type: tag.type,
              operator: { type: operator, value: value === YES_OPTION_VALUE },
            };
          default:
            throw new Error('Unknown tag type');
        }
      },
    );

    navigate({ search: { query } });
    close();
  };

  const handleAddTag = () => {
    form.insertListItem('query', { tagId: null, operator: '=' });
  };

  return (
    <Modal
      onClose={() => {
        form.reset();
        close();
      }}
      opened={opened}
      size="lg"
      title={t(($) => $.search.searchNotes)}
    >
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
    </Modal>
  );
};
