import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';

import { Route as HomeRoute } from '@/routes/_authenticated/home';
import { Route as SearchRoute } from '@/routes/_authenticated/searches.{-$searchId}';
import { useTRPC } from '@/utils/trpc';
import { type SearchNotesSchemaType } from '@repo/api';

export const useCurrentSearch = (): SearchNotesSchemaType => {
  const trpc = useTRPC();
  const homeSearchParams = useSearch({
    from: HomeRoute.id,
    shouldThrow: false,
  });

  const searchesSearchParams = useSearch({
    from: SearchRoute.id,
    shouldThrow: false,
  });

  const searchesParams = useParams({
    from: SearchRoute.id,
    shouldThrow: false,
  });

  // query for a recorded search, only enabled if we're at /searches/id
  const { data: searchData } = useQuery({
    ...trpc.searches.findSearchById.queryOptions({
      searchId: searchesParams?.searchId ?? '',
    }),
    enabled: !!searchesParams?.searchId,
  });

  if (homeSearchParams?.query) {
    return { query: homeSearchParams.query };
  }

  if (searchesSearchParams?.query) {
    return { query: searchesSearchParams.query };
  }

  if (searchData?.search) {
    return { query: searchData.search.content.query };
  }

  return { query: [] };
};
