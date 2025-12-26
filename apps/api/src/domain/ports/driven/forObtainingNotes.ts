import type { Note } from '@api/domain/entities/notes';

export type ForObtainingNotesDrivenPort = {
  findAll: (args: {
    where: Partial<Note> & { ids?: Note['id'][] };
  }) => Promise<Note[]>;

  findOne: (id: Note['id']) => Promise<Note | null>;
};
