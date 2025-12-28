import { and, eq, inArray } from 'drizzle-orm';
import { invariant } from 'es-toolkit';

import { db, type TransactionType } from '@api/db';
import { noteTags, tags } from '@api/db/schema';
import type { NoteTag } from '@api/domain/entities/noteTags';
import type { Tag } from '@api/domain/entities/tags';
import { TAG_TYPES } from '@api/domain/entities/tagTypes';
import type { ForStoringTagsAndNoteTagsDrivenPort } from '@api/domain/ports/driven/forStoringTagsAndNoteTags';

/**
 * Converts a note_tag from the database to a `NoteTag` from our domain.
 */
const toNoteTag = (
  tag: Tag,
  {
    valueBoolean,
    valueDate,
    valueNumber,
    ...data
  }: typeof noteTags.$inferSelect,
): NoteTag => {
  const { type, name } = tag;

  switch (type) {
    case TAG_TYPES.STRING:
      return { ...data, type, name, value: tag.name };
    case TAG_TYPES.BOOLEAN:
      return { ...data, type, name, value: valueBoolean ?? true };
    case TAG_TYPES.NUMBER:
      return { ...data, type, name, value: valueNumber ?? 0 };
    case TAG_TYPES.DATE:
      return { ...data, type, name, value: valueDate ?? '' };

    default:
      throw new Error('Unsupported type');
  }
};

const createTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['createTag'] =>
  async ({ name, type, createdBy, updatedBy }) => {
    const [newTag] = await tx
      .insert(tags)
      .values({ name, type, createdBy, updatedBy })
      .returning();

    return newTag;
  };

const editTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['editTag'] =>
  async ({ id, name, updatedBy }) => {
    const [updatedTag] = await tx
      .update(tags)
      .set({ name, updatedBy })
      .where(eq(tags.id, id))
      .returning();

    return updatedTag;
  };

const findAllTags =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['findAllTags'] =>
  async ({ where }) => {
    const allTags = await tx
      .select()
      .from(tags)
      .where(eq(tags.createdBy, where.createdBy));

    return allTags;
  };

const findOneTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['findOneTag'] =>
  async (id) => {
    const [tag] = await tx.select().from(tags).where(eq(tags.id, id)).limit(1);

    return tag;
  };

const createNoteTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['createNoteTag'] =>
  async ({ createdBy, noteId, tagId, type, updatedBy, value }) => {
    const [newNoteTag] = await tx
      .insert(noteTags)
      .values({
        noteId,
        tagId,
        valueBoolean: type === 'boolean' ? value : null,
        valueDate: type === 'date' ? value : null,
        valueNumber: type === 'number' ? value : null,
        createdBy,
        updatedBy,
      })
      .returning();

    const tag = await findOneTag(tx)(tagId);

    return toNoteTag(tag!, newNoteTag);
  };

const deleteNoteTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['deleteNoteTag'] =>
  async ({ noteId, tagId }) => {
    const [deletedNoteTag] = await tx
      .delete(noteTags)
      .where(and(eq(noteTags.tagId, tagId), eq(noteTags.noteId, noteId)))
      .returning();

    const tag = await findOneTag(tx)(tagId);

    return toNoteTag(tag!, deletedNoteTag);
  };

const editNoteTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['editNoteTag'] =>
  async ({ noteId, tagId, type, updatedBy, value }) => {
    const [updatedNoteTag] = await tx
      .update(noteTags)
      .set({
        noteId,
        tagId,
        valueBoolean: type === 'boolean' ? value : null,
        valueDate: type === 'date' ? value : null,
        valueNumber: type === 'number' ? value : null,
        updatedBy,
      })
      .returning();

    const tag = await findOneTag(tx)(tagId);

    return toNoteTag(tag!, updatedNoteTag);
  };

const findAllNoteTags =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['findAllNoteTags'] =>
  async ({ where }) => {
    const whereConditions = Object.keys(where).map((k) => {
      const key = k as keyof typeof where;
      const value = where[key];

      switch (key) {
        case 'noteIds':
          invariant(Array.isArray(value), 'value must be an array');
          return inArray(noteTags.noteId, value);
        case 'tagIds':
          invariant(Array.isArray(value), 'value must be an array');
          return inArray(noteTags.tagId, value);

        default:
          throw new Error('Unknown key');
      }
    });

    const queryResult = await tx
      .select()
      .from(noteTags)
      .where(and(...whereConditions))
      .innerJoin(tags, eq(noteTags.tagId, tags.id));

    const foundNoteTags = queryResult.map(({ tags: tag, note_tags: noteTag }) =>
      toNoteTag(tag, noteTag),
    );

    return foundNoteTags;
  };

const findOneNoteTag =
  (
    tx: TransactionType | typeof db,
  ): ForStoringTagsAndNoteTagsDrivenPort['findOneNoteTag'] =>
  async ({ noteId, tagId }) => {
    const [found] = await tx
      .select()
      .from(noteTags)
      .where(and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId)))
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .limit(1);

    if (!found) return null;

    const { tags: tag, note_tags: foundNoteTag } = found;

    return toNoteTag(tag, foundNoteTag);
  };

const atomic: ForStoringTagsAndNoteTagsDrivenPort['atomic'] = (fn) =>
  db.transaction((tx) =>
    fn({
      createNoteTag: createNoteTag(tx),
      createTag: createTag(tx),
      deleteNoteTag: deleteNoteTag(tx),
      editNoteTag: editNoteTag(tx),
      editTag: editTag(tx),
      findAllNoteTags: findAllNoteTags(tx),
      findAllTags: findAllTags(tx),
      findOneTag: findOneTag(tx),
      findOneNoteTag: findOneNoteTag(tx),
    }),
  );

export default {
  atomic,
  createNoteTag: createNoteTag(db),
  createTag: createTag(db),
  deleteNoteTag: deleteNoteTag(db),
  editNoteTag: editNoteTag(db),
  editTag: editTag(db),
  findAllNoteTags: findAllNoteTags(db),
  findAllTags: findAllTags(db),
  findOneTag: findOneTag(db),
  findOneNoteTag: findOneNoteTag(db),
} satisfies ForStoringTagsAndNoteTagsDrivenPort;
