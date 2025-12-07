import { ActionIcon, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TbTrash } from 'react-icons/tb';

import { type Search } from '@/models/searches';
import { useTRPC } from '@/utils/trpc';

interface SearchCardDeleteButtonProps {
  search: Search;
}

export const SearchCardDeleteButton = ({
  search,
}: SearchCardDeleteButtonProps) => {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: softDeleteSearches } = useMutation(
    trpc.searches.softDeleteSearches.mutationOptions(),
  );

  const onSuccess = () => {
    modals.closeAll();
    void queryClient.invalidateQueries(
      trpc.searches.findAllSearches.pathFilter(),
    );
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
