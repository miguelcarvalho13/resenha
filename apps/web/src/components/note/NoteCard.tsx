import { ActionIcon, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { TbPencil } from 'react-icons/tb';

import { type NoteForFindAll } from '@/models/notes';
import CreateOrEditNoteModal from './CreateOrEditNoteModal';

interface NoteCardProps {
  note: NoteForFindAll;
}

export const NoteCard = ({ note }: NoteCardProps) => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Paper data-testid="note-card" shadow="xs" p="xl">
      <Stack h="100%" justify="space-between">
        <Text className="line-clamp-2">{note.content}</Text>

        <Tooltip label={t(($) => $.notes.editNote)} withArrow>
          <ActionIcon
            aria-label={t(($) => $.notes.editNote)}
            className="self-end"
            onClick={open}
            radius="xl"
            variant="filled"
          >
            <TbPencil />
          </ActionIcon>
        </Tooltip>
      </Stack>

      <CreateOrEditNoteModal
        close={close}
        mode="edit"
        note={note}
        opened={opened}
      />
    </Paper>
  );
};
