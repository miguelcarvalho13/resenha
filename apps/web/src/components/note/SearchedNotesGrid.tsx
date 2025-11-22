import { Route as HomeRoute } from '@/routes/_authenticated/home';
import { trpc } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';

export const SearchedNotesGrid = () => {
  const { query } = HomeRoute.useSearch();
  const { data: findAllResponse, isLoading } =
    trpc.searches.searchNotes.useQuery({
      query: query ?? [],
    });

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
