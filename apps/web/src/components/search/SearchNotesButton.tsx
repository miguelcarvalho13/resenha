import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { SearchNotesModal } from './searchNotesModal/SearchNotesModal';

export const SearchNotesButton = () => {
  const { t } = useTranslation();
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>{t(($) => $.search.searchNotes)}</Button>
      <SearchNotesModal close={close} opened={opened} />
    </>
  );
};
