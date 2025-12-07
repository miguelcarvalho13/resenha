import { useQuery } from '@tanstack/react-query';

import { Route as HomeRoute } from '@/routes/_authenticated/home';
import { useTRPC } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';

export const SearchedNotesGrid = () => {
  const trpc = useTRPC();
  const { query } = HomeRoute.useSearch();
  const { data: findAllResponse, isLoading } = useQuery(
    trpc.searches.searchNotes.queryOptions({
      query: query ?? [],
    }),
  );

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
