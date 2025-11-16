import { Badge, Group, type BadgeProps } from '@mantine/core';

export interface TagWrapperProps extends BadgeProps {}

export const TagWrapper = ({ children, ...props }: TagWrapperProps) => (
  <Badge data-testid="tag" size="md" {...props}>
    <Group className="gap-0.5">{children}</Group>
  </Badge>
);
