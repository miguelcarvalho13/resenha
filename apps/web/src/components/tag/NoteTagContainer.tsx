import { Box, Group, Skeleton, Space } from '@mantine/core';

import { NoteTag } from '@/components/tag/NoteTag';
import { type NoteForFindAll } from '@/models/notes';
import { trpc } from '@/utils/trpc';

interface NoteTagContainerProps {
  note: NoteForFindAll;
}

export const NoteTagContainer = ({ note }: NoteTagContainerProps) => {
  const { data, isLoading } = trpc.tags.findAllNoteTags.useQuery({
    noteId: note.id,
  });

  if (isLoading) {
    return <Skeleton />;
  }

  if (!data?.noteTags) {
    return (
      <Box data-testid="tags-container">
        <Space />
      </Box>
    );
  }

  return (
    <Group data-testid="tags-container" gap="xs">
      {data.noteTags.map((noteTag) => (
        <NoteTag key={`${noteTag.noteId}|${noteTag.tagId}`} noteTag={noteTag} />
      ))}
    </Group>
  );
};
