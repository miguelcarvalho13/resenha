import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import CreateOrEditNoteModal from '@/components/note/CreateOrEditNoteModal';

const CreateNoteButton = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <CreateOrEditNoteModal opened={opened} close={close} />
      <Button onClick={open}>Create note</Button>
    </>
  );
};

export default CreateNoteButton;
