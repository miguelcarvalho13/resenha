import type { Note } from '@api/domain/entities/notes';
import type { SearchContent } from '@api/domain/entities/searches';

export type ForObtainingNotesDrivenPort = {
  findAll: (args: {
    where: Partial<Note> & { ids?: Note['id'][] };
  }) => Promise<Note[]>;

  findAllBySearch: (args: {
    where: { search: SearchContent } & Pick<Note, 'createdBy'>;
  }) => Promise<Note[]>;

  findOne: (id: Note['id']) => Promise<Note | null>;
};
