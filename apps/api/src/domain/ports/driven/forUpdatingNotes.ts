import type { Note } from '@api/domain/entities/notes';

export type ForUpdatingNotesDrivenPort = {
  create: (
    data: Pick<Note, 'content' | 'createdBy' | 'updatedBy'>,
  ) => Promise<Note>;

  edit: (data: Pick<Note, 'id' | 'content' | 'updatedBy'>) => Promise<Note>;

  hardDeleteNotes: (ids: Note['id'][]) => Promise<Note[]>;

  softDeleteNotes: (
    ids: Note['id'][],
    updatedBy: Note['updatedBy'],
  ) => Promise<Note[]>;

  undoDeleteNotes: (
    ids: Note['id'][],
    updatedBy: Note['updatedBy'],
  ) => Promise<Note[]>;
};
