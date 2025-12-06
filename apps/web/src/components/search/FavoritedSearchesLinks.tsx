import { Group, Skeleton, Text } from '@mantine/core';

import { trpc } from '@/utils/trpc';
import { SearchFavoriteButton } from './SearchFavoriteButton';
import { SearchReadableText } from './SearchReadableText';
import { NavLinkStyled } from '../link/NavLinkStyled';

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
          <NavLinkStyled
            to="/searches/{-$searchId}"
            label={
              <Text flex={1} truncate="end">
                {search.name ? (
                  search.name
                ) : (
                  <SearchReadableText search={search} />
                )}
              </Text>
            }
            params={{ searchId: search.id }}
          />
          <SearchFavoriteButton search={search} />
        </Group>
      ))}
    </>
  );
};
