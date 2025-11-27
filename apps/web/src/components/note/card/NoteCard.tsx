import { ActionIcon, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbPencil } from 'react-icons/tb';

import { useOpenCreateOrEditNoteModal } from '@/components/note/createOrEditModal/useOpenCreateOrEditNoteModal';
import { type NoteForFindAll } from '@/models/notes';
import { NoteCardDeleteButton } from './NoteCardDeleteButton';

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

        <Group gap="xs" justify="end">
          <Tooltip
            label={t(($) => $.notes.editNote)}
            openDelay={1000}
            withArrow
          >
            <ActionIcon
              aria-label={t(($) => $.notes.editNote)}
              onClick={() => openNoteModal(note)}
              radius="xl"
              variant="filled"
            >
              <TbPencil />
            </ActionIcon>
          </Tooltip>

          <NoteCardDeleteButton note={note} />
        </Group>
      </Stack>
    </Paper>
  );
};
