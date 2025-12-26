import { and, eq, inArray } from 'drizzle-orm';

import { db } from '@api/db';
import { notes } from '@api/db/schema';
import type { ForUpdatingNotesDrivenPort } from '@api/domain/ports/driven/forUpdatingNotes';

const create: ForUpdatingNotesDrivenPort['create'] = async ({
  content,
  createdBy,
  updatedBy,
}) => {
  const [newNote] = await db
    .insert(notes)
    .values({ content, createdBy, updatedBy })
    .returning();

  return newNote;
};

const edit: ForUpdatingNotesDrivenPort['edit'] = async ({
  id,
  content,
  updatedBy,
}) => {
  const [updatedNote] = await db
    .update(notes)
    .set({ content, updatedBy })
    .where(eq(notes.id, id))
    .returning();

  return updatedNote;
};

const hardDeleteNotes: ForUpdatingNotesDrivenPort['hardDeleteNotes'] = async (
  ids,
) => {
  const hardDeletedNotes = await db
    .delete(notes)
    .where(and(inArray(notes.id, ids)))
    .returning();

  return hardDeletedNotes;
};

const softDeleteNotes: ForUpdatingNotesDrivenPort['softDeleteNotes'] = async (
  ids,
  updatedBy,
) => {
  const softDeletedNotes = await db
    .update(notes)
    .set({
      deletedAt: new Date(),
      deletedBy: updatedBy,
      updatedBy,
    })
    .where(and(inArray(notes.id, ids)))
    .returning();

  return softDeletedNotes;
};

const undoDeleteNotes: ForUpdatingNotesDrivenPort['undoDeleteNotes'] = async (
  ids,
  updatedBy,
) => {
  const restoredSoftDeleteNotes = await db
    .update(notes)
    .set({
      deletedAt: null,
      deletedBy: null,
      updatedBy,
    })
    .where(and(inArray(notes.id, ids)))
    .returning();

  return restoredSoftDeleteNotes;
};

export default {
  create,
  edit,
  hardDeleteNotes,
  softDeleteNotes,
  undoDeleteNotes,
} satisfies ForUpdatingNotesDrivenPort;
