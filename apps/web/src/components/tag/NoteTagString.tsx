import { TextInput, UnstyledButton } from '@mantine/core';
import { useState } from 'react';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagStringProps {
  noteTag: NoteTagModel;
  onChange: (value: string) => void;
}

export const NoteTagString = ({ noteTag, onChange }: NoteTagStringProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string) => {
    setIsEditing(false);

    if (value.trim().length && value !== noteTag.value) {
      onChange(value);
    }
  };

  return (
    <NoteTagWrapper color="orange" data-testid="tag">
      {!isEditing && (
        <UnstyledButton
          aria-label={`Edit ${noteTag.name}`}
          className="uppercase"
          onClick={() => setIsEditing(true)}
          style={{ '--mantine-font-size-md': 'var(--badge-fz-md)' }}
        >
          {noteTag.name}
        </UnstyledButton>
      )}
      {isEditing && (
        <TextInput
          aria-label={`Edit ${noteTag.name} value`}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          defaultValue={noteTag.name}
          onBlur={(e) => handleOnChange(e.target.value)}
          placeholder={`Edit ${noteTag.name} value`}
          variant="unstyled"
        />
      )}
    </NoteTagWrapper>
  );
};
