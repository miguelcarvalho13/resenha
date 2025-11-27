import { trpc } from '@/utils/trpc';
import { type SearchNotesSchemaType } from '@repo/api';
import { NotesGrid } from './NotesGrid';

const query: SearchNotesSchemaType['query'] = [
  { field: 'deleted', operator: { type: '>', value: '2000-01-01' } },
];

export const SoftDeletedNotesGrid = () => {
  const { data: softDeletedNotesData, isLoading } =
    trpc.searches.searchNotes.useQuery({ query });

  if (isLoading) {
    return null;
  }

  return <NotesGrid notes={softDeletedNotesData?.notes} />;
};
