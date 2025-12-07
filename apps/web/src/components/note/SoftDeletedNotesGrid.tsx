import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@/utils/trpc';
import { type SearchNotesSchemaType } from '@repo/api';
import { NotesGrid } from './NotesGrid';

const query: SearchNotesSchemaType['query'] = [
  { field: 'deleted', operator: { type: '>', value: '2000-01-01' } },
];

export const SoftDeletedNotesGrid = () => {
  const trpc = useTRPC();
  const { data: softDeletedNotesData, isLoading } = useQuery(
    trpc.searches.searchNotes.queryOptions({ query }),
  );

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={softDeletedNotesData?.notes} />;
};
