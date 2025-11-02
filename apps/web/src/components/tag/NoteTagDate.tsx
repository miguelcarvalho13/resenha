import { DateInput } from '@mantine/dates';
import { useState } from 'react';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { NoteTagButton } from './NoteTagButton';
import { NoteTagRemoveButton } from './NoteTagRemoveButton';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagDateProps {
  disabled: boolean;
  noteTag: NoteTagModel;
  onChange: (value: string) => void;
  onRemove: (noteTag: NoteTagModel) => void;
}

export const NoteTagDate = ({
  disabled,
  noteTag,
  onChange,
  onRemove,
}: NoteTagDateProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string | null) => {
    setIsEditing(false);

    if (value && value.trim().length && value !== noteTag.value) {
      onChange(value);
    }
  };

  return (
    <NoteTagWrapper
      color="red"
      data-testid="tag"
      rightSection={
        <NoteTagRemoveButton
          disabled={disabled}
          onRemove={() => onRemove(noteTag)}
          tagName={noteTag.name}
        />
      }
    >
      {noteTag.name}:{' '}
      {!isEditing && (
        <NoteTagButton
          aria-label={`Edit ${noteTag.name}`}
          disabled={disabled}
          onClick={() => setIsEditing(true)}
        >
          {noteTag.value}
        </NoteTagButton>
      )}
      {isEditing && (
        <DateInput
          aria-label={`Edit ${noteTag.name} value`}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className="inline-block"
          defaultValue={noteTag.value as string}
          onBlur={() => handleOnChange(null)}
          onChange={(value) => handleOnChange(value)}
          placeholder={`Edit ${noteTag.name} value`}
          size="xs"
          valueFormat="YYYY-MM-DD"
          variant="unstyled"
        />
      )}
    </NoteTagWrapper>
  );
};
