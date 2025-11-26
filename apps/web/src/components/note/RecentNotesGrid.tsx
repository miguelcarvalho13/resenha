import { trpc } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';

export const RecentNotesGrid = () => {
  const { data: findAllResponse, isLoading } =
    trpc.searches.searchNotes.useQuery({ query: [] });

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
