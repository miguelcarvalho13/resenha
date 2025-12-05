import { ActionIcon, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { TbTrash } from 'react-icons/tb';

import { type Search } from '@/models/searches';
import { trpc } from '@/utils/trpc';

interface SearchCardDeleteButtonProps {
  search: Search;
}

export const SearchCardDeleteButton = ({
  search,
}: SearchCardDeleteButtonProps) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { mutate: softDeleteSearches } =
    trpc.searches.softDeleteSearches.useMutation();

  const onSuccess = () => {
    modals.closeAll();
    void utils.searches.findAllSearches.invalidate();
  };

  const handleOnClick = () => {
    modals.openConfirmModal({
      cancelProps: { children: t(($) => $.common.cancel) },
      confirmProps: { children: t(($) => $.common.confirm), color: 'red' },
      title: t(($) => $.search.deleteSearchModal.title),
      onCancel: () => modals.closeAll(),
      onConfirm: () =>
        softDeleteSearches({ searchIds: [search.id] }, { onSuccess }),
    });
  };

  return (
    <Tooltip label={t(($) => $.search.deleteSearch)} openDelay={1000} withArrow>
      <ActionIcon
        aria-label={t(($) => $.search.deleteSearch)}
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
