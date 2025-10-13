import { Paper, Text } from '@mantine/core';

import { type NoteForFindAll } from '@/models/notes';

interface NoteCardProps {
  note: NoteForFindAll;
}

export const NoteCard = ({ note }: NoteCardProps) => (
  <Paper data-testid="note-card" shadow="xs" p="xl">
    <Text className="line-clamp-2">{note.content}</Text>
  </Paper>
);
