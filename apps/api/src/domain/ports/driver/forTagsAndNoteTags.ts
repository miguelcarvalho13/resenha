import type { DrivenContext } from '@api/domain/context';
import type { NoteTag } from '@api/domain/entities/noteTags';
import type { Session } from '@api/domain/entities/session';
import type { Tag } from '@api/domain/entities/tags';

export type ForTagsAndNoteTagsDriverPort = (
  ctx: Pick<DrivenContext, 'forStoringTagsAndNoteTags'>,
) => {
  // Tags
  createTag: (
    data: Pick<Tag, 'name' | 'type'>,
    session: Session,
  ) => Promise<Tag>;

  editTag: (data: Pick<Tag, 'id' | 'name'>, session: Session) => Promise<Tag>;

  findAllTags: (session: Session) => Promise<Tag[]>;

  // NoteTags
  createNoteTag: (
    data: Pick<NoteTag, 'noteId' | 'type'>,
    session: Session,
  ) => Promise<NoteTag>;

  deleteNoteTag: (
    data: Pick<NoteTag, 'noteId' | 'tagId'>,
    session: Session,
  ) => Promise<NoteTag>;

  editNoteTag: (
    data: Pick<NoteTag, 'noteId' | 'tagId' | 'value'>,
    session: Session,
  ) => Promise<NoteTag>;

  findAllNoteTags: (
    data: Pick<NoteTag, 'noteId'>,
    session: Session,
  ) => Promise<NoteTag[]>;
};
