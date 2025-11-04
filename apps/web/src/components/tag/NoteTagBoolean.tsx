import { Group, NativeSelect } from '@mantine/core';
import { useState } from 'react';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { TAG_COLOR } from '@/utils/tags';
import { NoteTagButton } from './NoteTagButton';
import { NoteTagRemoveButton } from './NoteTagRemoveButton';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagBooleanProps {
  disabled: boolean;
  noteTag: NoteTagModel;
  onChange: (value: boolean) => void;
  onRemove: (noteTag: NoteTagModel) => void;
}

const NO_OPTION = 'NO';
const YES_OPTION = 'YES';
const SELECT_OPTIONS = [YES_OPTION, NO_OPTION];

export const NoteTagBoolean = ({
  disabled,
  noteTag,
  onChange,
  onRemove,
}: NoteTagBooleanProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string | null) => {
    setIsEditing(false);

    if (value && value.trim().length && value !== noteTag.value) {
      switch (value) {
        case YES_OPTION:
          return onChange(true);
        case NO_OPTION:
          return onChange(false);
        default:
          throw new Error('Not a possible option');
      }
    }
  };

  return (
    <Group>
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
        {noteTag.name}:{' '}
        {!isEditing && (
          <NoteTagButton
            aria-label={`Edit ${noteTag.name}`}
            disabled={disabled}
            onClick={() => setIsEditing(true)}
          >
            {noteTag.value === true ? 'yes' : 'no'}
          </NoteTagButton>
        )}
        {isEditing && (
          <NativeSelect
            aria-label={`Edit ${noteTag.name} value`}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="inline-block"
            data={SELECT_OPTIONS}
            defaultValue={noteTag.value === true ? YES_OPTION : NO_OPTION}
            onBlur={() => handleOnChange(null)}
            onChange={(e) => handleOnChange(e.target.value)}
            size="xs"
            variant="unstyled"
          />
        )}
      </NoteTagWrapper>
    </Group>
  );
};
