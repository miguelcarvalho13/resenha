import { SimpleGrid } from '@mantine/core';

import { type NoteForFindAll } from '@/models/notes';
import { NoteCard } from '@/components/note/NoteCard';

interface NotesGridProps {
  notes: NoteForFindAll[] | undefined;
}

export const NotesGrid = ({ notes }: NotesGridProps) => {
  if (!notes) {
    return 'No notes found';
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 5 }}
      spacing={{ base: 10, sm: 'xl' }}
      verticalSpacing={{ base: 'md', sm: 'xl' }}
    >
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </SimpleGrid>
  );
};
