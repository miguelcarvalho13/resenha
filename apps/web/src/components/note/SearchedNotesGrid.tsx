import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@/utils/trpc';
import { useCurrentSearch } from '../search/useCurrentSearch';
import { NotesGrid } from './NotesGrid';

export const SearchedNotesGrid = () => {
  const trpc = useTRPC();

  const currentSearch = useCurrentSearch();
  const { data: findAllResponse, isLoading } = useQuery(
    trpc.searches.searchNotes.queryOptions(currentSearch),
  );

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
