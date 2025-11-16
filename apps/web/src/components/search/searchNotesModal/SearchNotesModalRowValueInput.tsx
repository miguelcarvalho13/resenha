import {
  NumberInput,
  type NumberInputProps,
  Select,
  type SelectProps,
  type TextInputProps,
} from '@mantine/core';
import { DateInput, type DateInputProps } from '@mantine/dates';
import { useTranslation } from 'react-i18next';

import { SELECT_OPTION_VALUES, type Tag } from '@/models/tags';

type SearchNotesModalRowValueInputProps =
  | { type: Tag['type'] }
  | { type: 'string' & TextInputProps }
  | { type: 'boolean' & SelectProps }
  | { type: 'number' & NumberInputProps }
  | { type: 'date' & DateInputProps };

export const SearchNotesModalRowValueInput = ({
  type,
  ...props
}: SearchNotesModalRowValueInputProps) => {
  const { t } = useTranslation();

  if (type === 'string') {
    return null;
  }

  if (type === 'boolean') {
    const options = SELECT_OPTION_VALUES.map((value) => ({
      label: t(($) => $.tags.tagBoolean, { context: value }),
      value,
    }));

    return (
      <Select
        allowDeselect={false}
        aria-label={t(($) => $.search.modal.value)}
        data={options}
        disabled={options.length <= 1}
        {...props}
      />
    );
  }

  if (type === 'date') {
    return (
      <DateInput
        aria-label={t(($) => $.search.modal.value)}
        // placeholder={t(($) => $.tags.editTagValue, { name: noteTag.name })}
        valueFormat="YYYY-MM-DD"
        {...props}
      />
    );
  }

  if (type === 'number') {
    return (
      <NumberInput
        aria-label={t(($) => $.search.modal.value)}
        // placeholder={t(($) => $.tags.editTagValue, { name: noteTag.name })}
        {...props}
      />
    );
  }

  return null;
};
