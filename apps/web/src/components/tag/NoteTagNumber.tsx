import { NumberInput } from '@mantine/core';
import { useState } from 'react';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { NoteTagWrapper } from './NoteTagWrapper';
import { NoteTagButton } from './NoteTagButton';

interface NoteTagStringProps {
  disabled: boolean;
  noteTag: NoteTagModel;
  onChange: (value: number) => void;
}

export const NoteTagNumber = ({
  disabled,
  noteTag,
  onChange,
}: NoteTagStringProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string) => {
    setIsEditing(false);

    if (value.trim().length && value != noteTag.value) {
      onChange(Number(value));
    }
  };

  return (
    <NoteTagWrapper color="blue" data-testid="tag">
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
        <NumberInput
          aria-label={`Edit ${noteTag.name} value`}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          defaultValue={noteTag.value as number}
          onBlur={(e) => handleOnChange(e.target.value)}
          placeholder={`Edit ${noteTag.name} value`}
          variant="unstyled"
        />
      )}
    </NoteTagWrapper>
  );
};
