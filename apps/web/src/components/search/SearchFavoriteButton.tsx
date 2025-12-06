import { ActionIcon, type ActionIconProps, Tooltip } from '@mantine/core';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useTranslation } from 'react-i18next';
import { TbStar, TbStarFilled } from 'react-icons/tb';

import { type Search } from '@/models/searches';
import { trpc } from '@/utils/trpc';

interface SearchFavoriteButtonProps extends Omit<ActionIconProps, 'onClick'> {
  search: Search;
}

export const SearchFavoriteButton = ({
  search,
  ...props
}: SearchFavoriteButtonProps) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { mutate: editSearch } = trpc.searches.editSearch.useMutation();

  const onSuccess = () => {
    void utils.searches.findAllSearches.invalidate();
  };

  const mutationsCount = useIsMutating({
    mutationKey: getQueryKey(trpc.searches.editSearch),
  });
  const queriesCount = useIsFetching({
    queryKey: getQueryKey(trpc.searches.findAllSearches),
  });

  const isPending = mutationsCount > 0 || queriesCount > 0;

  const handleOnClick = () => {
    editSearch({ id: search.id, favorited: !search.favorited }, { onSuccess });
  };

  return (
    <Tooltip
      label={t(($) => $.search.favoriteSearch)}
      openDelay={1000}
      withArrow
    >
      <ActionIcon
        aria-label={t(($) => $.search.favoriteSearch)}
        color="yellow"
        disabled={isPending}
        onClick={handleOnClick}
        radius="xl"
        variant="subtle"
        {...props}
      >
        {search.favorited ? <TbStarFilled /> : <TbStar />}
      </ActionIcon>
    </Tooltip>
  );
};
