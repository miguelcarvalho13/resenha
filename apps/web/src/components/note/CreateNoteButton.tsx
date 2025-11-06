import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

import CreateOrEditNoteModal from '@/components/note/CreateOrEditNoteModal';

const CreateNoteButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <CreateOrEditNoteModal mode="create" opened={opened} close={close} />
      <Button onClick={open}>{t(($) => $.notes.createNote)}</Button>
    </>
  );
};

export default CreateNoteButton;
