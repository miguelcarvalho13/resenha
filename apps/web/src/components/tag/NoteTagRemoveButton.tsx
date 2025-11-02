import { ActionIcon } from '@mantine/core';
import { TbX } from 'react-icons/tb';

interface NoteTagRemoveButtonProps {
  disabled: boolean;
  onRemove: () => void;
  tagName: string;
}

export const NoteTagRemoveButton = ({
  disabled,
  onRemove,
  tagName,
}: NoteTagRemoveButtonProps) => (
  <ActionIcon
    aria-label={`Remove ${tagName}`}
    disabled={disabled}
    onClick={onRemove}
    radius="xl"
    size="xs"
    variant="white"
  >
    <TbX />
  </ActionIcon>
);
