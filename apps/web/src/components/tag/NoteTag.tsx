import { Badge, type BadgeProps } from '@mantine/core';

import { type NoteTag as NoteTagModel } from '@/models/tags';

interface NoteTagProps {
  noteTag: NoteTagModel;
}

export const NoteTag = ({ noteTag }: NoteTagProps) => {
  const commonProps: BadgeProps = { size: 'md' };

  switch (noteTag.type) {
    case 'string':
      return (
        <Badge color="orange" data-testid="tag" {...commonProps}>
          {noteTag.name}
        </Badge>
      );
    case 'number':
      return (
        <Badge color="blue" data-testid="tag" {...commonProps}>
          {noteTag.name}: {noteTag.value}
        </Badge>
      );
    case 'boolean':
      return (
        <Badge color="green" data-testid="tag" {...commonProps}>
          {noteTag.name}: {noteTag.value === true ? 'yes' : 'no'}
        </Badge>
      );
    case 'date':
      return (
        <Badge color="red" data-testid="tag" {...commonProps}>
          {noteTag.name}: {noteTag.value}
        </Badge>
      );
  }
};
