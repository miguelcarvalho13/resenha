import { TextInput } from '@mantine/core';
import { useState } from 'react';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { TAG_COLOR } from '@/utils/tags';
import { NoteTagButton } from './NoteTagButton';
import { NoteTagRemoveButton } from './NoteTagRemoveButton';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagStringProps {
  disabled: boolean;
  noteTag: NoteTagModel;
  onChange: (value: string) => void;
  onRemove: (noteTag: NoteTagModel) => void;
}

export const NoteTagString = ({
  disabled,
  noteTag,
  onChange,
  onRemove,
}: NoteTagStringProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string) => {
    setIsEditing(false);

    if (value.trim().length && value !== noteTag.value) {
      onChange(value);
    }
  };

  return (
    <NoteTagWrapper
      color={TAG_COLOR[noteTag.type]}
      data-testid="tag"
      rightSection={
        <NoteTagRemoveButton
          disabled={disabled}
          onRemove={() => onRemove(noteTag)}
          tagName={noteTag.name}
        />
      }
    >
      {!isEditing && (
        <NoteTagButton
          aria-label={`Edit ${noteTag.name}`}
          disabled={disabled}
          onClick={() => setIsEditing(true)}
        >
          {noteTag.name}
        </NoteTagButton>
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
