import { type NoteTag as NoteTagModel } from '@/models/tags';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagProps {
  noteTag: NoteTagModel;
}

export const NoteTag = ({ noteTag }: NoteTagProps) => {
  switch (noteTag.type) {
    case 'string':
      return (
        <NoteTagWrapper color="orange" data-testid="tag">
          {noteTag.name}
        </NoteTagWrapper>
      );
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
