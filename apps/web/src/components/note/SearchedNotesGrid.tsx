import { Route as RouteIndex } from '@/routes/index';
import { trpc } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';

export const SearchedNotesGrid = () => {
  const { query } = RouteIndex.useSearch();
  const { data: findAllResponse, isLoading } =
    trpc.searches.searchNotes.useQuery({
      query: query ?? [],
    });

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
