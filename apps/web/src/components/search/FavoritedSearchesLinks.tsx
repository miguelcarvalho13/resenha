import { Group, Skeleton, Text } from '@mantine/core';

import { trpc } from '@/utils/trpc';
import { SearchFavoriteButton } from './SearchFavoriteButton';
import { SearchReadableText } from './SearchReadableText';

export const FavoritedSearchesLinks = () => {
  const { data: findAllResponse, isLoading } =
    trpc.searches.findAllSearches.useQuery();

  const favoritedSearches = findAllResponse?.searches.filter(
    (s) => s.favorited,
  );

  if (isLoading) {
    return (
      <>
        <Skeleton />
      </>
    );
  }

  return (
    <>
      {favoritedSearches?.map((search) => (
        <Group data-testid="search-favorite" key={search.id} wrap="nowrap">
          <Text flex={1} truncate="end">
            <SearchReadableText search={search} />
          </Text>
          <SearchFavoriteButton search={search} />
        </Group>
      ))}
    </>
  );
};
