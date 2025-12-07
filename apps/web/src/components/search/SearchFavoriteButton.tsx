import { ActionIcon, type ActionIconProps, Tooltip } from '@mantine/core';
import {
  useIsFetching,
  useIsMutating,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TbStar, TbStarFilled } from 'react-icons/tb';

import { type Search } from '@/models/searches';
import { useTRPC } from '@/utils/trpc';

interface SearchFavoriteButtonProps extends Omit<ActionIconProps, 'onClick'> {
  search: Search;
}

export const SearchFavoriteButton = ({
  search,
  ...props
}: SearchFavoriteButtonProps) => {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: editSearch } = useMutation(
    trpc.searches.editSearch.mutationOptions(),
  );

  const onSuccess = () => {
    void queryClient.invalidateQueries(
      trpc.searches.findAllSearches.pathFilter(),
    );
  };

  const mutationsCount = useIsMutating({
    mutationKey: trpc.searches.editSearch.mutationKey(),
  });
  const queriesCount = useIsFetching({
    queryKey: trpc.searches.findAllSearches.queryKey(),
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
