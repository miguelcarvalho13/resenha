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

  const { mutate: editNoteTag, isPending } = trpc.tags.editNoteTag.useMutation({
    onSuccess: async () => {
      await utils.tags.findAllNoteTags.invalidate({ noteId: noteTag.noteId });
    },
  });

  const handleTagEdit = (value: NoteTagModel['value']) => {
    editNoteTag({
      noteId: noteTag.noteId,
      tagId: noteTag.tagId,
      value,
    });
  };

  switch (noteTag.type) {
    case 'string':
      return (
        <NoteTagString
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
        />
      );
    case 'number':
      return (
        <NoteTagNumber
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
        />
      );
    case 'boolean':
      return (
        <NoteTagBoolean
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
        />
      );
    case 'date':
      return (
        <NoteTagDate
          disabled={isPending}
          noteTag={noteTag}
          onChange={handleTagEdit}
        />
      );
  }
};
