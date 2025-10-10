import { trpc } from '@/utils/trpc';
import { NotesGrid } from './NotesGrid';

export const RecentNotesGrid = () => {
  const { data: findAllResponse, isLoading } = trpc.notes.findAll.useQuery();

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={findAllResponse?.notes} />;
};
