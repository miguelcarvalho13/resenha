import dayjs from 'dayjs';
import { and, desc, eq, gt, gte, inArray, isNull, lt, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  invariant,
  isDate,
  isNull as isNullPredicate,
  isString,
  partition,
} from 'es-toolkit';

import { db } from '@api/db';
import { notes, noteTags } from '@api/db/schema';
import type { DateOperatorsType } from '@api/domain/entities/searches';
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

const whereFactory = (type: DateOperatorsType['type']) => {
  switch (type) {
    case '=':
      return eq;
    case '<':
      return lt;
    case '<=':
      return lte;
    case '>':
      return gt;
    case '>=':
      return gte;
  }
};

const findAllBySearch: ForObtainingNotesDrivenPort['findAllBySearch'] = async ({
  where: { search, createdBy },
}) => {
  const query = db
    .select({
      note: notes,
    })
    .from(notes)
    .orderBy(desc(notes.updatedAt))
    .$dynamic();

  const [fieldFilters, tagFilters] = partition(
    search.query,
    (q) => 'field' in q,
  );

  const queryFilteredByTag = tagFilters.reduce((builder, q, index) => {
    const where = whereFactory(q.operator.type);

    const noteTagAlias = alias(noteTags, `noteTags${index}`);

    switch (q.type) {
      case 'string':
        return builder.innerJoin(
          noteTagAlias,
          and(
            eq(notes.id, noteTagAlias.noteId),
            eq(noteTagAlias.tagId, q.tagId),
          ),
        );
      case 'number':
        return builder.innerJoin(
          noteTagAlias,
          and(
            eq(notes.id, noteTagAlias.noteId),
            eq(noteTagAlias.tagId, q.tagId),
            where(noteTagAlias.valueNumber, q.operator.value),
          ),
        );
      case 'boolean':
        return builder.innerJoin(
          noteTagAlias,
          and(
            eq(notes.id, noteTagAlias.noteId),
            eq(noteTagAlias.tagId, q.tagId),
            where(noteTagAlias.valueBoolean, q.operator.value),
          ),
        );
      case 'date':
        return builder.innerJoin(
          noteTagAlias,
          and(
            eq(notes.id, noteTagAlias.noteId),
            eq(noteTagAlias.tagId, q.tagId),
            where(noteTagAlias.valueDate, q.operator.value),
          ),
        );
      default:
        throw new Error('Wrong type provided');
    }
  }, query);

  const hasDeletedFilter = fieldFilters.some((f) => f.field === 'deleted');

  const allNotes = await queryFilteredByTag.where(
    and(
      ...[
        eq(notes.createdBy, createdBy),
        ...(hasDeletedFilter ? [] : [isNull(notes.deletedAt)]),
        ...fieldFilters.map((filter) => {
          const where = whereFactory(filter.operator.type);
          const value = dayjs(filter.operator.value).toDate();

          switch (filter.field) {
            case 'deleted':
              return where(notes.deletedAt, value);

            default:
              throw new Error('Wrong type provided');
          }
        }),
      ],
    ),
  );

  return allNotes.map(({ note }) => note);
};

const findOne: ForObtainingNotesDrivenPort['findOne'] = async (id) => {
  const [note] = await db.select().from(notes).where(eq(notes.id, id)).limit(1);

  return note;
};

export default {
  findAll,
  findAllBySearch,
  findOne,
} satisfies ForObtainingNotesDrivenPort;
