import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

import CreateOrEditNoteModal from '@/components/note/createOrEditModal/CreateOrEditNoteModal';
import { type NoteForFindAll } from '@/models/notes';

export const useOpenCreateOrEditNoteModal = () => {
  const { t } = useTranslation();

  const openNoteModal = (note?: NoteForFindAll) =>
    modals.open({
      centered: true,
      closeButtonProps: { 'aria-label': t(($) => $.common.close) },
      title: note ? t(($) => $.notes.editNote) : t(($) => $.notes.createNote),
      children: <CreateOrEditNoteModal note={note} />,
      size: 'lg',
    });

  return { openNoteModal };
};
