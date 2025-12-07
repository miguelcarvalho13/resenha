import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@/utils/trpc';
import { SearchesGrid } from './SearchesGrid';

export const AllSearchesGrid = () => {
  const trpc = useTRPC();
  const { data: findAllResponse, isLoading } = useQuery(
    trpc.searches.findAllSearches.queryOptions(),
  );

  if (isLoading) {
    return null;
  }

  return <SearchesGrid searches={findAllResponse?.searches} />;
};
