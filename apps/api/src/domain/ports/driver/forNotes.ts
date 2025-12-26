import type { DrivenContext } from '@api/domain/context';
import type { Session } from '@api/domain/entities/session';
import type { Note } from '@api/domain/entities/notes';

export type ForNotesDriverPort = (
  ctx: Pick<DrivenContext, 'forObtainingNotes' | 'forUpdatingNotes'>,
) => {
  findAll: (session: Session) => Promise<Note[]>;

  create: (data: Pick<Note, 'content'>, session: Session) => Promise<Note>;

  edit: (data: Pick<Note, 'id' | 'content'>, session: Session) => Promise<Note>;

  hardDeleteNotes: (ids: Note['id'][], session: Session) => Promise<Note[]>;

  softDeleteNotes: (ids: Note['id'][], session: Session) => Promise<Note[]>;

  undoDeleteNotes: (ids: Note['id'][], session: Session) => Promise<Note[]>;
};
