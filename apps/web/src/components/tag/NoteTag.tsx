import { type NoteTag as NoteTagModel } from '@/models/tags';
import { trpc } from '@/utils/trpc';
import { NoteTagString } from './NoteTagString';
import { NoteTagWrapper } from './NoteTagWrapper';
import { NoteTagNumber } from './NoteTagNumber';
import { NoteTagDate } from './NoteTagDate';

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
        <NoteTagWrapper color="green" data-testid="tag">
          {noteTag.name}: {noteTag.value === true ? 'yes' : 'no'}
        </NoteTagWrapper>
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
