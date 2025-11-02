import { type NoteTag as NoteTagModel } from '@/models/tags';
import { trpc } from '@/utils/trpc';
import { NoteTagString } from './NoteTagString';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagProps {
  noteTag: NoteTagModel;
}

export const NoteTag = ({ noteTag }: NoteTagProps) => {
  const utils = trpc.useUtils();
  const { mutate: editNoteTag } = trpc.tags.editNoteTag.useMutation({
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
      return <NoteTagString noteTag={noteTag} onChange={handleTagEdit} />;
    case 'number':
      return (
        <NoteTagWrapper color="blue" data-testid="tag">
          {noteTag.name}: {noteTag.value}
        </NoteTagWrapper>
      );
    case 'boolean':
      return (
        <NoteTagWrapper color="green" data-testid="tag">
          {noteTag.name}: {noteTag.value === true ? 'yes' : 'no'}
        </NoteTagWrapper>
      );
    case 'date':
      return (
        <NoteTagWrapper color="red" data-testid="tag">
          {noteTag.name}: {noteTag.value}
        </NoteTagWrapper>
      );
  }
};
