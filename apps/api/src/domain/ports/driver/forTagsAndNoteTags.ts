import type { DrivenContext } from '@api/domain/context';
import type { NoteTag } from '@api/domain/entities/noteTags';
import type { Session } from '@api/domain/entities/session';
import type { Tag } from '@api/domain/entities/tags';
import type { DistributivePick } from '@api/utils/types';

export type ForTagsAndNoteTagsDriverPort = (
  ctx: Pick<DrivenContext, 'forStoringTagsAndNoteTags' | 'forObtainingNotes'>,
) => {
  // Tags
  createTag: (
    data: Pick<Tag, 'name' | 'type'>,
    session: Session,
  ) => Promise<Tag>;

  editTag: (data: Pick<Tag, 'id' | 'name'>, session: Session) => Promise<Tag>;

  findOneTag: (data: Pick<Tag, 'id'>, session: Session) => Promise<Tag | null>;

  findAllTags: (session: Session) => Promise<Tag[]>;

  // NoteTags
  createNoteTag: (
    data: DistributivePick<NoteTag, 'name' | 'noteId' | 'type' | 'value'>,
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
