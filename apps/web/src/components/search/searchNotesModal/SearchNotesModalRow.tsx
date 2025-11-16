import { trpc } from '@/utils/trpc';
import { Group } from '@mantine/core';
import { useSearchModalFormContext } from './SearchNotesModal.form';
import { SearchNotesModalRowOperatorInput } from './SearchNotesModalRowOperatorInput';
import { SearchNotesModalRowTagInput } from './SearchNotesModalRowTagInput';
import { SearchNotesModalRowValueInput } from './SearchNotesModalRowValueInput';

interface SearchNotesModalRowProps {
  index: number;
}

export const SearchNotesModalRow = ({ index }: SearchNotesModalRowProps) => {
  const form = useSearchModalFormContext();

  const tagId = form.getValues().query[index].tagId;
  const { data: tagsData } = trpc.tags.findAllTags.useQuery();
  const currentTag = tagsData?.tags.find(({ id }) => id === tagId);

  return (
    <Group data-testid="tags-filter">
      <SearchNotesModalRowTagInput
        {...form.getInputProps(`query.${index}.tagId`)}
      />

      {currentTag && (
        <>
          <SearchNotesModalRowOperatorInput
            type={currentTag.type}
            {...form.getInputProps(`query.${index}.operator`)}
          />
          <SearchNotesModalRowValueInput
            type={currentTag.type}
            {...form.getInputProps(`query.${index}.value`)}
          />
        </>
      )}
    </Group>
  );
};
