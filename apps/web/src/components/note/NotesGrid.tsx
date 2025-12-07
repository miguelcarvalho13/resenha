import { useTranslation } from 'react-i18next';

import { CommonGrid } from '@/components/common/CommonGrid';
import { NoteCard } from '@/components/note/card/NoteCard';
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
    <CommonGrid>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </CommonGrid>
  );
};
