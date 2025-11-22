import { ActionIcon, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbPencil } from 'react-icons/tb';

import { useOpenCreateOrEditNoteModal } from '@/components/note/createOrEditModal/useOpenCreateOrEditNoteModal';
import { type NoteForFindAll } from '@/models/notes';

interface NoteCardProps {
  note: NoteForFindAll;
}

export const NoteCard = ({ note }: NoteCardProps) => {
  const { t } = useTranslation();
  const { openNoteModal } = useOpenCreateOrEditNoteModal();

  return (
    <Paper data-testid="note-card" shadow="xs" p="xl">
      <Stack h="100%" justify="space-between">
        <Text className="line-clamp-2">{note.content}</Text>

        <Tooltip label={t(($) => $.notes.editNote)} withArrow>
          <ActionIcon
            aria-label={t(($) => $.notes.editNote)}
            className="self-end"
            onClick={() => openNoteModal(note)}
            radius="xl"
            variant="filled"
          >
            <TbPencil />
          </ActionIcon>
        </Tooltip>
      </Stack>
    </Paper>
  );
};
