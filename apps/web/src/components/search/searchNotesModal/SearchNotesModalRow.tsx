import { trpc } from '@/utils/trpc';
import { ActionIcon, Flex, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { TbMinus } from 'react-icons/tb';
import { useSearchModalFormContext } from './SearchNotesModal.form';
import { SearchNotesModalRowOperatorInput } from './SearchNotesModalRowOperatorInput';
import { SearchNotesModalRowTagInput } from './SearchNotesModalRowTagInput';
import { SearchNotesModalRowValueInput } from './SearchNotesModalRowValueInput';

interface SearchNotesModalRowProps {
  index: number;
}

export const SearchNotesModalRow = ({ index }: SearchNotesModalRowProps) => {
  const { t } = useTranslation();
  const form = useSearchModalFormContext();

  const tagId = form.getValues().query[index].tagId;
  const { data: tagsData } = trpc.tags.findAllTags.useQuery();
  const currentTag = tagsData?.tags.find(({ id }) => id === tagId);

  return (
    <>
      {index > 0 && (
        <Text c="dimmed" my="xs" size="xs" ta="center">
          {t(($) => $.common.and)}
        </Text>
      )}

      <Group data-testid="tags-filter">
        <Flex
          align={{ base: 'stretch', xs: 'center' }}
          direction={{ base: 'column', xs: 'row' }}
          flex={1}
          gap={{ base: 'xs', xs: 'sm' }}
        >
          <SearchNotesModalRowTagInput
            {...form.getInputProps(`query.${index}.tagId`)}
          />

          {currentTag && (
            <>
              <SearchNotesModalRowOperatorInput
                flex={1}
                type={currentTag.type}
                {...form.getInputProps(`query.${index}.operator`)}
              />
              <SearchNotesModalRowValueInput
                type={currentTag.type}
                {...form.getInputProps(`query.${index}.value`)}
              />
            </>
          )}
        </Flex>

        <ActionIcon
          aria-label={t(($) => $.common.remove)}
          onClick={() => form.removeListItem('query', index)}
          radius="xl"
          variant="subtle"
        >
          <TbMinus aria-label={t(($) => $.common.remove)} />
        </ActionIcon>
      </Group>
    </>
  );
};
