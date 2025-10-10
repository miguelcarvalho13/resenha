import { Paper, Text } from '@mantine/core';

import { type NoteForFindAll } from '@/models/notes';

interface NoteCardProps {
  note: NoteForFindAll;
}

export const NoteCard = ({ note }: NoteCardProps) => {
  const content = note.content.substring(0, 50);

  return (
    <Paper data-testid="note-card" shadow="xs" p="xl">
      <Text>{content}</Text>
    </Paper>
  );
};
