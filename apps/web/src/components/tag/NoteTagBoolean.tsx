import { Group, NativeSelect } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const NO_OPTION_VALUE = 'NO';
const YES_OPTION_VALUE = 'YES';
const SELECT_OPTION_VALUES = [YES_OPTION_VALUE, NO_OPTION_VALUE] as const;

export const NoteTagBoolean = ({
  disabled,
  noteTag,
  onChange,
  onRemove,
}: NoteTagBooleanProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const options = SELECT_OPTION_VALUES.map((value) => ({
    label: t(($) => $.tags.tagBoolean, { context: value }),
    value,
  }));

  const handleOnChange = (value: string | null) => {
    setIsEditing(false);

    if (value && value.trim().length && value !== noteTag.value) {
      switch (value) {
        case YES_OPTION_VALUE:
          return onChange(true);
        case NO_OPTION_VALUE:
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
            aria-label={t(($) => $.tags.editTag, { name: noteTag.name })}
            disabled={disabled}
            onClick={() => setIsEditing(true)}
          >
            {noteTag.value === true
              ? t(($) => $.tags.tagBoolean_YES).toLocaleLowerCase()
              : t(($) => $.tags.tagBoolean_NO).toLocaleLowerCase()}
          </NoteTagButton>
        )}
        {isEditing && (
          <NativeSelect
            aria-label={t(($) => $.tags.editTagValue, { name: noteTag.name })}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="inline-block"
            data={options}
            defaultValue={
              noteTag.value === true ? YES_OPTION_VALUE : NO_OPTION_VALUE
            }
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
