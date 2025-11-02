import { type NoteTag as NoteTagModel } from '@/models/tags';
import { trpc } from '@/utils/trpc';
import { NoteTagBoolean } from './NoteTagBoolean';
import { NoteTagDate } from './NoteTagDate';
import { NoteTagNumber } from './NoteTagNumber';
import { NoteTagString } from './NoteTagString';

interface NoteTagProps {
  noteTag: NoteTagModel;
}

export const NoteTag = ({ noteTag }: NoteTagProps) => {
  const utils = trpc.useUtils();

  const onSuccess = async () => {
    await utils.tags.findAllNoteTags.invalidate({ noteId: noteTag.noteId });
  };

  const { mutate: editNoteTag, isPending: isPendingEdition } =
    trpc.tags.editNoteTag.useMutation({
      onSuccess,
    });

  const { mutate: deleteNoteTag, isPending: isPendingDeletion } =
    trpc.tags.deleteNoteTag.useMutation({
      onSuccess,
    });

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
