import { ActionIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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
}: NoteTagRemoveButtonProps) => {
  const { t } = useTranslation();

  return (
    <ActionIcon
      aria-label={t(($) => $.tags.removeTag, { name: tagName })}
      className="-mr-2"
      color="white"
      disabled={disabled}
      onClick={onRemove}
      radius="xl"
      size="xs"
      variant="transparent"
    >
      <TbX />
    </ActionIcon>
  );
};
