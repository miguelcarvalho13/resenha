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
  const { mutate: hardDeleteNotes } = trpc.notes.hardDeleteNotes.useMutation();

  const isSoftDeleted = !!note.deletedAt;

  const onSuccess = () => {
    modals.closeAll();
    void utils.searches.searchNotes.invalidate();
  };

  const handleSoftDelete = () => {
    softDeleteNotes({ noteIds: [note.id] }, { onSuccess });
  };

  const handleHardDelete = () => {
    hardDeleteNotes({ noteIds: [note.id] }, { onSuccess });
  };

  const handleOnClick = () => {
    if (isSoftDeleted) {
      modals.openConfirmModal({
        cancelProps: { children: t(($) => $.common.cancel) },
        confirmProps: { children: t(($) => $.common.confirm), color: 'red' },
        title: t(($) => $.notes.hardDeleteModal.title),
        onCancel: () => modals.closeAll(),
        onConfirm: handleHardDelete,
      });
    } else {
      modals.openConfirmModal({
        cancelProps: { children: t(($) => $.common.cancel) },
        confirmProps: { children: t(($) => $.common.confirm) },
        title: t(($) => $.notes.softDeleteModal.title),
        onCancel: () => modals.closeAll(),
        onConfirm: handleSoftDelete,
      });
    }
  };

  return (
    <Tooltip label={t(($) => $.notes.deleteNote)} openDelay={1000} withArrow>
      <ActionIcon
        aria-label={t(($) => $.notes.deleteNote)}
        color="red"
        onClick={handleOnClick}
        radius="xl"
        variant="subtle"
      >
        <TbTrash />
      </ActionIcon>
    </Tooltip>
  );
};
