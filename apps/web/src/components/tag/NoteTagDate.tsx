import { DateInput } from '@mantine/dates';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type NoteTag as NoteTagModel } from '@/models/tags';
import { TAG_COLOR } from '@/utils/tags';
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
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (value: string | null) => {
    setIsEditing(false);

    if (value && value.trim().length && value !== noteTag.value) {
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
        <DateInput
          aria-label={t(($) => $.tags.editTagValue, { name: noteTag.name })}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className="inline-block"
          defaultValue={noteTag.value as string}
          onBlur={() => handleOnChange(null)}
          onChange={(value) => handleOnChange(value)}
          placeholder={t(($) => $.tags.editTagValue, { name: noteTag.name })}
          size="xs"
          valueFormat="YYYY-MM-DD"
          variant="unstyled"
        />
      )}
    </NoteTagWrapper>
  );
};
