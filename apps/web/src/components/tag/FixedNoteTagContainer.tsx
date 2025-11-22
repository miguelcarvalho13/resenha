import { Group } from '@mantine/core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { type NoteForFindAll } from '@/models/notes';
import { TAG_COLOR } from '@/utils/tags';
import { TagWrapper } from './TagWrapper';

interface FixedNoteTagContainerProps {
  note: NoteForFindAll;
}

export const FixedNoteTagContainer = ({ note }: FixedNoteTagContainerProps) => {
  const { t } = useTranslation();

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
    </Group>
  );
};
