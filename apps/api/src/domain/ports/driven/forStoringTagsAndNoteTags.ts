import type { NoteTag } from '@api/domain/entities/noteTags';
import type { Tag } from '@api/domain/entities/tags';
import type { DistributiveOmit } from '@api/utils/types';

export type ForStoringTagsAndNoteTagsDrivenPort = {
  // Tags
  findAllTags: (args: { where: Pick<Tag, 'createdBy'> }) => Promise<Tag[]>;

  findOneTag: (
    args: Partial<Pick<Tag, 'id' | 'createdBy' | 'name' | 'type'>>,
  ) => Promise<Tag | null>;

  createTag: (
    data: Pick<Tag, 'name' | 'type' | 'createdBy' | 'updatedBy'>,
  ) => Promise<Tag>;

  editTag: (data: Pick<Tag, 'id' | 'name' | 'updatedBy'>) => Promise<Tag>;

  // NoteTags
  findAllNoteTags: (args: {
    where: {
      createdBy: NoteTag['createdBy'];
      noteIds?: NoteTag['noteId'][];
      tagIds?: NoteTag['tagId'][];
    };
  }) => Promise<NoteTag[]>;

  findOneNoteTag: (
    args: Pick<NoteTag, 'noteId' | 'tagId'>,
  ) => Promise<NoteTag | null>;

  createNoteTag: (
    data: DistributiveOmit<NoteTag, 'name' | 'createdAt' | 'updatedAt'>,
  ) => Promise<NoteTag>;

  deleteNoteTag: (data: Pick<NoteTag, 'noteId' | 'tagId'>) => Promise<NoteTag>;

  editNoteTag: (
    data: DistributiveOmit<
      NoteTag,
      'createdAt' | 'createdBy' | 'name' | 'updatedAt'
    >,
  ) => Promise<NoteTag>;

  /**
   * To handle all operations in an atomic way, e.g if anything fails we rollback to the original state.
   */
  atomic: <T>(
    fn: (
      port: Omit<ForStoringTagsAndNoteTagsDrivenPort, 'atomic'>,
    ) => Promise<T>,
  ) => Promise<T>;
};
