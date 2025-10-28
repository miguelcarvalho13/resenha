import { Badge, type BadgeProps } from '@mantine/core';

interface NoteTagWrapperProps extends BadgeProps {}

export const NoteTagWrapper = ({ children, ...props }: NoteTagWrapperProps) => (
  <Badge data-testid="tag" size="md" {...props}>
    {children}
  </Badge>
);
