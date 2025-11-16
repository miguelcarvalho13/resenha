import { Select, type SelectProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { type SearchOperators } from '@/models/searches';
import { type Tag } from '@/models/tags';

interface SearchNotesModalRowOperatorInputProps extends SelectProps {
  type: Tag['type'];
}

const getOptions = (type: Tag['type']): SearchOperators[] => {
  switch (type) {
    case 'string':
      return [];
    case 'number':
    case 'date':
      return ['<', '<=', '=', '>', '>='];
    case 'boolean':
      return ['='];
    default:
      throw new Error('Unknown tag type');
  }
};

export const SearchNotesModalRowOperatorInput = ({
  type,
  ...props
}: SearchNotesModalRowOperatorInputProps) => {
  const { t } = useTranslation();

  if (type === 'string') {
    return null;
  }

  const options = getOptions(type).map((value) => ({
    label: t(($) => $.search.operator, { context: value }),
    value,
  }));

  return (
    <Select
      allowDeselect={false}
      aria-label={t(($) => $.search.modal.operator)}
      data={options}
      disabled={options.length <= 1}
      {...props}
    />
  );
};
