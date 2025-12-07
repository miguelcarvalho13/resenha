import { Skeleton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@/utils/trpc';
import { NavbarSearchLink } from './NavbarSearchLink';

export const NavbarSearchesLinks = () => {
  const trpc = useTRPC();
  const { data: findAllResponse, isLoading } = useQuery(
    trpc.searches.findAllSearches.queryOptions(),
  );

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
