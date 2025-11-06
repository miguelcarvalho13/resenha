import { SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { NoteCard } from '@/components/note/NoteCard';
import { type NoteForFindAll } from '@/models/notes';

interface NotesGridProps {
  notes: NoteForFindAll[] | undefined;
}

export const NotesGrid = ({ notes }: NotesGridProps) => {
  const { t } = useTranslation();

  if (!notes) {
    return t(($) => $.notes.noNotesFound);
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
