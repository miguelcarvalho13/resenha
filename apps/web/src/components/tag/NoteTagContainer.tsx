import { Group, Skeleton } from '@mantine/core';

import { NoteTag } from '@/components/tag/NoteTag';
import { type NoteForFindAll } from '@/models/notes';
import { trpc } from '@/utils/trpc';
import { AddTagButton } from './AddTagButton';

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

  return (
    <Group data-testid="tags-container" gap="xs">
      {data?.noteTags.map((noteTag) => (
        <NoteTag key={`${noteTag.noteId}|${noteTag.tagId}`} noteTag={noteTag} />
      ))}
      <AddTagButton noteId={note.id} />
    </Group>
  );
};
