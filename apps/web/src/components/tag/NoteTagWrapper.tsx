import { Badge, Group, type BadgeProps } from '@mantine/core';

interface NoteTagWrapperProps extends BadgeProps {}

export const NoteTagWrapper = ({ children, ...props }: NoteTagWrapperProps) => (
  <Badge data-testid="tag" size="md" {...props}>
    <Group className="gap-0.5">{children}</Group>
  </Badge>
);
