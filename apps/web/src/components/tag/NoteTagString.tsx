import { ActionIcon, Group, TextInput } from '@mantine/core';
import { useState } from 'react';
import { TbX } from 'react-icons/tb';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { NoteTagButton } from './NoteTagButton';
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
    <NoteTagWrapper color="orange" data-testid="tag">
      <Group className="gap-0.5">
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
        <ActionIcon
          aria-label={`Remove ${noteTag.name}`}
          disabled={disabled}
          onClick={() => onRemove(noteTag)}
          radius="xl"
          size="xs"
          variant="white"
        >
          <TbX />
        </ActionIcon>
      </Group>
    </NoteTagWrapper>
  );
};
