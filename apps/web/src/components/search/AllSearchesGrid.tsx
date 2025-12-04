import { trpc } from '@/utils/trpc';
import { SearchesGrid } from './SearchesGrid';

export const AllSearchesGrid = () => {
  const { data: findAllResponse, isLoading } =
    trpc.searches.findAllSearches.useQuery();

  if (isLoading) {
    return null;
  }

  return <SearchesGrid searches={findAllResponse?.searches} />;
};
