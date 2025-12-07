import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { useTRPC } from '@/utils/trpc';
import { NoteTagBoolean } from './NoteTagBoolean';
import { NoteTagDate } from './NoteTagDate';
import { NoteTagNumber } from './NoteTagNumber';
import { NoteTagString } from './NoteTagString';

interface NoteTagProps {
  noteTag: NoteTagModel;
}

export const NoteTag = ({ noteTag }: NoteTagProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const onSuccess = async () => {
    await queryClient.invalidateQueries(
      trpc.tags.findAllNoteTags.queryFilter({ noteId: noteTag.noteId }),
    );
  };

  const { mutate: editNoteTag, isPending: isPendingEdition } = useMutation(
    trpc.tags.editNoteTag.mutationOptions({
      onSuccess,
    }),
  );

  const { mutate: deleteNoteTag, isPending: isPendingDeletion } = useMutation(
    trpc.tags.deleteNoteTag.mutationOptions({
      onSuccess,
    }),
  );

  const handleTagEdit = (value: NoteTagModel['value']) => {
    editNoteTag({
      noteId: noteTag.noteId,
      tagId: noteTag.tagId,
      value,
    });
  };

  const handleTagDelete = (noteTag: NoteTagModel) => {
    deleteNoteTag({
      noteId: noteTag.noteId,
      tagId: noteTag.tagId,
    });
  };

  const isPending = isPendingDeletion || isPendingEdition;

  switch (noteTag.type) {
    case 'string':
      return (
        <NoteTagString
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
          onRemove={handleTagDelete}
        />
      );
    case 'number':
      return (
        <NoteTagNumber
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
          onRemove={handleTagDelete}
        />
      );
    case 'boolean':
      return (
        <NoteTagBoolean
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
          onRemove={handleTagDelete}
        />
      );
    case 'date':
      return (
        <NoteTagDate
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
          onRemove={handleTagDelete}
        />
      );
  }
};
