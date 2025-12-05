import { type Search } from '@/models/searches';
import { trpc } from '@/utils/trpc';
import { ActionIcon, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbStar, TbStarFilled } from 'react-icons/tb';

interface SearchFavoriteButtonProps {
  search: Search;
}

export const SearchFavoriteButton = ({ search }: SearchFavoriteButtonProps) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { mutate: editSearch, isPending } =
    trpc.searches.editSearch.useMutation();

  const onSuccess = () => {
    void utils.searches.findAllSearches.invalidate();
  };

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
      >
        {search.favorited ? <TbStarFilled /> : <TbStar />}
      </ActionIcon>
    </Tooltip>
  );
};
