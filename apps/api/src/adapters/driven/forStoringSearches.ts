import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import {
  invariant,
  isDate,
  isNull as isNullPredicate,
  isString,
} from 'es-toolkit';

import { db, type TransactionType } from '@api/db';
import { searches } from '@api/db/schema';
import type { ForStoringSearchesDrivenPort } from '@api/domain/ports/driven/forStoringSearches';

const create =
  (tx: TransactionType | typeof db): ForStoringSearchesDrivenPort['create'] =>
  async ({ content, createdBy, updatedBy }) => {
    const [newSearch] = await tx
      .insert(searches)
      .values({ content, createdBy, updatedBy })
      .returning();

    return newSearch;
  };

const edit =
  (tx: TransactionType | typeof db): ForStoringSearchesDrivenPort['edit'] =>
  async ({ id, updatedBy, ...data }) => {
    const [updatedSearch] = await tx
      .update(searches)
      .set({
        ...('content' in data ? { content: data.content } : {}),
        ...('favorited' in data ? { favorited: data.favorited } : {}),
        ...('name' in data ? { name: data.name } : {}),
        updatedBy,
      })
      .where(eq(searches.id, id))
      .returning();

    return updatedSearch;
  };

const findAll =
  (tx: TransactionType | typeof db): ForStoringSearchesDrivenPort['findAll'] =>
  async ({ where }) => {
    const whereConditions = Object.keys(where).map((k) => {
      const key = k as keyof typeof where;
      const value = where[key];

      switch (key) {
        case 'createdBy':
          invariant(isString(value), 'value must be a string');
          return eq(searches[key], value);
        case 'deletedAt':
          invariant(
            isDate(value) || isNullPredicate(value),
            'value must be a date or null',
          );
          return isNullPredicate(value)
            ? isNull(searches[key])
            : eq(searches[key], value);
        case 'ids':
          invariant(Array.isArray(value), 'value must be an array');
          return inArray(searches.id, value);

        default:
          throw new Error('Unknown key');
      }
    });

    const allSearches = await tx
      .select()
      .from(searches)
      .where(and(...whereConditions))
      .orderBy(desc(searches.createdAt));

    return allSearches;
  };

const findOne =
  (tx: TransactionType | typeof db): ForStoringSearchesDrivenPort['findOne'] =>
  async ({ id }) => {
    const [foundSearch] = await tx
      .select()
      .from(searches)
      .where(eq(searches.id, id))
      .limit(1);

    return foundSearch;
  };

const hardDelete =
  (
    tx: TransactionType | typeof db,
  ): ForStoringSearchesDrivenPort['hardDelete'] =>
  async (ids) => {
    const hardDeletedSearches = await tx
      .delete(searches)
      .where(and(inArray(searches.id, ids)))
      .returning();

    return hardDeletedSearches;
  };

const softDelete =
  (
    tx: TransactionType | typeof db,
  ): ForStoringSearchesDrivenPort['softDelete'] =>
  async (ids, updatedBy) => {
    const softDeletedSearches = await tx
      .update(searches)
      .set({
        deletedAt: new Date(),
        deletedBy: updatedBy,
        updatedBy,
      })
      .where(and(inArray(searches.id, ids)))
      .returning();

    return softDeletedSearches;
  };

const undoDelete =
  (
    tx: TransactionType | typeof db,
  ): ForStoringSearchesDrivenPort['undoDelete'] =>
  async (ids, updatedBy) => {
    const restoredSoftDeletedSearches = await tx
      .update(searches)
      .set({
        deletedAt: null,
        deletedBy: null,
        updatedBy,
      })
      .where(and(inArray(searches.id, ids)))
      .returning();

    return restoredSoftDeletedSearches;
  };

export default {
  create: create(db),
  edit: edit(db),
  findAll: findAll(db),
  findOne: findOne(db),
  hardDelete: hardDelete(db),
  softDelete: softDelete(db),
  undoDelete: undoDelete(db),
} satisfies ForStoringSearchesDrivenPort;
