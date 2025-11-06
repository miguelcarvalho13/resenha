import { NumberInput } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { TAG_COLOR } from '@/utils/tags';
import { NoteTagButton } from './NoteTagButton';
import { NoteTagRemoveButton } from './NoteTagRemoveButton';
import { NoteTagWrapper } from './NoteTagWrapper';

interface NoteTagStringProps {
  disabled: boolean;
  noteTag: NoteTagModel;
  onChange: (value: number) => void;
  onRemove: (noteTag: NoteTagModel) => void;
}

export const NoteTagNumber = ({
  disabled,
  noteTag,
  onChange,
  onRemove,
}: NoteTagStringProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string) => {
    setIsEditing(false);

    if (value.trim().length && value != noteTag.value) {
      onChange(Number(value));
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
      {noteTag.name}:{' '}
      {!isEditing && (
        <NoteTagButton
          aria-label={t(($) => $.tags.editTag, { name: noteTag.name })}
          disabled={disabled}
          onClick={() => setIsEditing(true)}
        >
          {noteTag.value}
        </NoteTagButton>
      )}
      {isEditing && (
        <NumberInput
          aria-label={t(($) => $.tags.editTagValue, { name: noteTag.name })}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className="inline-block"
          defaultValue={noteTag.value as number}
          onBlur={(e) => handleOnChange(e.target.value)}
          placeholder={t(($) => $.tags.editTagValue, { name: noteTag.name })}
          size="xs"
          variant="unstyled"
        />
      )}
    </NoteTagWrapper>
  );
};
