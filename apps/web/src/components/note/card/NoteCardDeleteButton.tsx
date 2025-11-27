import { ActionIcon, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbTrash } from 'react-icons/tb';
import { modals } from '@mantine/modals';

import { type NoteForFindAll } from '@/models/notes';
import { trpc } from '@/utils/trpc';

interface NoteCardDeleteButtonProps {
  note: NoteForFindAll;
}

export const NoteCardDeleteButton = ({ note }: NoteCardDeleteButtonProps) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { mutate: softDeleteNotes } = trpc.notes.softDeleteNotes.useMutation();

  const onSuccess = () => {
    modals.closeAll();
    void utils.searches.searchNotes.invalidate();
  };

  const handleSoftDelete = () => {
    softDeleteNotes({ noteIds: [note.id] }, { onSuccess });
  };

  return (
    <Tooltip label={t(($) => $.notes.deleteNote)} openDelay={1000} withArrow>
      <ActionIcon
        aria-label={t(($) => $.notes.deleteNote)}
        color="red"
        onClick={() =>
          modals.openConfirmModal({
            cancelProps: { children: t(($) => $.common.cancel) },
            confirmProps: { children: t(($) => $.common.confirm) },
            title: t(($) => $.notes.softDeleteModal.title),
            onCancel: () => modals.closeAll(),
            onConfirm: handleSoftDelete,
          })
        }
        radius="xl"
        variant="filled"
      >
        <TbTrash />
      </ActionIcon>
    </Tooltip>
  );
};
