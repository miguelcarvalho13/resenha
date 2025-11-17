import { Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { TbZoom } from 'react-icons/tb';

import { SearchNotesModal } from './searchNotesModal/SearchNotesModal';

export const SearchNotesButton = () => {
  const { t } = useTranslation();
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <>
      <Button
        aria-label={t(($) => $.search.searchNotes)}
        bd={{ xs: '1px solid var(--mantine-color-default-border)' }}
        flex={{ xs: 1 }}
        justify="start"
        leftSection={<TbZoom />}
        maw={{ xs: 250 }}
        onClick={open}
        variant="transparent"
      >
        <Text c="dimmed" visibleFrom="xs">
          {t(($) => $.search.searchNotes)}
        </Text>
      </Button>
      <SearchNotesModal close={close} opened={opened} />
    </>
  );
};
