import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import {
  invariant,
  isDate,
  isNull as isNullPredicate,
  isString,
} from 'es-toolkit';

import { db } from '@api/db';
import { notes } from '@api/db/schema';
import type { ForObtainingNotesDrivenPort } from '@api/domain/ports/driven/forObtainingNotes';

const findAll: ForObtainingNotesDrivenPort['findAll'] = async ({ where }) => {
  const whereConditions = Object.keys(where).map((k) => {
    const key = k as keyof typeof where;
    const value = where[key];

    switch (key) {
      case 'ids':
        invariant(Array.isArray(value), 'value must be an array');
        return inArray(notes.id, value);
      case 'id':
      case 'content':
      case 'createdBy':
      case 'updatedBy':
        invariant(isString(value), 'value must be a string');
        return eq(notes[key], value);
      case 'createdAt':
      case 'updatedAt':
        invariant(isDate(value), 'value must be a date');
        return eq(notes[key], value);
      case 'deletedAt':
        invariant(
          isDate(value) || isNullPredicate(value),
          'value must be a date or null',
        );
        return isNullPredicate(value)
          ? isNull(notes[key])
          : eq(notes[key], value);
      case 'deletedBy':
        invariant(
          isString(value) || isNullPredicate(value),
          'value must be a string or null',
        );
        return isNullPredicate(value)
          ? isNull(notes[key])
          : eq(notes[key], value);

      default:
        throw new Error('Unknown key');
    }
  });

  return db
    .select()
    .from(notes)
    .where(and(...whereConditions))
    .orderBy(desc(notes.updatedAt));
};

const findOne: ForObtainingNotesDrivenPort['findOne'] = async (id) => {
  const [note] = await db.select().from(notes).where(eq(notes.id, id)).limit(1);

  return note;
};

export default {
  findAll,
  findOne,
} satisfies ForObtainingNotesDrivenPort;
