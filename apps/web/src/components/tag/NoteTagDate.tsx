import { DateInput } from '@mantine/dates';
import { useState } from 'react';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { NoteTagWrapper } from './NoteTagWrapper';
import { NoteTagButton } from './NoteTagButton';

interface NoteTagDateProps {
  disabled: boolean;
  noteTag: NoteTagModel;
  onChange: (value: string) => void;
}

export const NoteTagDate = ({
  disabled,
  noteTag,
  onChange,
}: NoteTagDateProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string | null) => {
    setIsEditing(false);

    if (value && value.trim().length && value !== noteTag.value) {
      onChange(value);
    }
  };

  return (
    <NoteTagWrapper color="red" data-testid="tag">
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
