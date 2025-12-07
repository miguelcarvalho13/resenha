import { Group, Skeleton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { NoteTag } from '@/components/tag/NoteTag';
import { type NoteForFindAll } from '@/models/notes';
import { useTRPC } from '@/utils/trpc';
import { AddTagButton } from './AddTagButton';

interface NoteTagContainerProps {
  note: NoteForFindAll;
}

export const NoteTagContainer = ({ note }: NoteTagContainerProps) => {
  const trpc = useTRPC();
  const { isLoading: isLoadingTags } = useQuery(
    trpc.tags.findAllTags.queryOptions(),
  );
  const { data, isLoading: isLoadingNoteTags } = useQuery(
    trpc.tags.findAllNoteTags.queryOptions({
      noteId: note.id,
    }),
  );

  if (isLoadingTags || isLoadingNoteTags) {
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
