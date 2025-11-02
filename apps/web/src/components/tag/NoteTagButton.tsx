import { type ReactNode } from 'react';
import { UnstyledButton } from '@mantine/core';

interface NoteTagButtonProps {
  'aria-label': string;
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}

export const NoteTagButton = ({ children, ...props }: NoteTagButtonProps) => (
  <UnstyledButton
    className="uppercase"
    style={{ '--mantine-font-size-md': 'var(--badge-fz-md)' }}
    {...props}
  >
    {children}
  </UnstyledButton>
);
