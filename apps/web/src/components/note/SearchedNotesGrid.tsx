import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';

import { Route as HomeRoute } from '@/routes/_authenticated/home';
import { useTRPC } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';
import { type Search } from '@/models/searches';

interface SearchedNotesGridProps {
  search?: Search;
}

export const SearchedNotesGrid = ({ search }: SearchedNotesGridProps) => {
  const trpc = useTRPC();

  const searchParams = useSearch({
    from: HomeRoute.id,
    shouldThrow: false,
  });

  const query = searchParams?.query ?? search?.content.query;
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
