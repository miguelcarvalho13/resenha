import { Group } from '@mantine/core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { type NoteForFindAll } from '@/models/notes';
import { TAG_COLOR } from '@/utils/tags';
import { trpc } from '@/utils/trpc';
import { NoteTagRemoveButton } from './NoteTagRemoveButton';
import { TagWrapper } from './TagWrapper';

interface FixedNoteTagContainerProps {
  note: NoteForFindAll;
}

export const FixedNoteTagContainer = ({ note }: FixedNoteTagContainerProps) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const {
    mutate: undoSoftDeletion,
    isPending,
    isSuccess,
  } = trpc.notes.undoSoftDeletedNotes.useMutation({
    onSuccess: () => {
      void utils.searches.searchNotes.invalidate();
    },
  });

  return (
    <Group data-testid="fixed-tags-container" gap="xs">
      <TagWrapper color={TAG_COLOR['date']}>
        {t(($) => $.tags.fixed.created)}:{' '}
        {dayjs(note.createdAt).format('YYYY-MM-DD')}
      </TagWrapper>

      <TagWrapper color={TAG_COLOR['date']}>
        {t(($) => $.tags.fixed.updated)}:{' '}
        {dayjs(note.updatedAt).format('YYYY-MM-DD')}
      </TagWrapper>

      {!!note.deletedAt && !isSuccess && (
        <TagWrapper
          color={TAG_COLOR['date']}
          rightSection={
            <NoteTagRemoveButton
              disabled={isPending}
              onRemove={() => undoSoftDeletion({ noteIds: [note.id] })}
              tagName={t(($) => $.tags.fixed.deleted)}
            />
          }
        >
          {t(($) => $.tags.fixed.deleted)}:{' '}
          {dayjs(note.deletedAt).format('YYYY-MM-DD')}
        </TagWrapper>
      )}
    </Group>
  );
};
