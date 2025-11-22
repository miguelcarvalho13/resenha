import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useOpenCreateOrEditNoteModal } from '@/components/note/createOrEditModal/useOpenCreateOrEditNoteModal';

const CreateNoteButton = () => {
  const { t } = useTranslation();
  const { openNoteModal } = useOpenCreateOrEditNoteModal();

  return (
    <Button onClick={() => openNoteModal()}>
      {t(($) => $.notes.createNote)}
    </Button>
  );
};

export default CreateNoteButton;
