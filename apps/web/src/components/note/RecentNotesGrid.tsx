import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';

export const RecentNotesGrid = () => {
  const trpc = useTRPC();
  const { data: findAllResponse, isLoading } = useQuery(
    trpc.searches.searchNotes.queryOptions({ query: [] }),
  );

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
