import { Skeleton } from '@mantine/core';

import { trpc } from '@/utils/trpc';
import { NavbarSearchLink } from './NavbarSearchLink';

export const NavbarSearchesLinks = () => {
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
        <NavbarSearchLink key={search.id} search={search} />
      ))}
    </>
  );
};
