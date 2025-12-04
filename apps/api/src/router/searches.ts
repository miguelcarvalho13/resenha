import dayjs from 'dayjs';
import { and, desc, eq, gt, gte, inArray, isNull, lt, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { db } from '@api/db';
import { notes, noteTags, searches } from '@api/db/schema';
import {
  createSearchSchema,
  type DateOperatorsType,
  editSearchSchema,
  hardDeleteSearchesSchema,
  searchNotesSchema,
  softDeleteSearchesSchema,
  undoSoftDeletedSearchesSchema,
} from '@api/schemas/searches';
import { protectedProcedure, router } from '@api/trpc';
import { partition } from '@api/utils/array';
import { TRPCError } from '@trpc/server';

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

export const searchesRouter = router({
  createSearch: protectedProcedure
    .input(createSearchSchema())
    .mutation(async ({ input, ctx }) => {
      const { content } = input;

      const [newSearch] = await db
        .insert(searches)
        .values({
          content,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .returning();

      return {
        success: true,
        search: newSearch,
      };
    }),

  findAllSearches: protectedProcedure.query(async ({ ctx }) => {
    const allSearches = await db
      .select()
      .from(searches)
      .where(
        and(isNull(searches.deletedAt), eq(searches.createdBy, ctx.user.id)),
      )
      .orderBy(desc(searches.updatedAt));

    return {
      success: true,
      searches: allSearches,
    };
  }),

  hardDeleteSearches: protectedProcedure
    .input(hardDeleteSearchesSchema())
    .mutation(async ({ input, ctx }) => {
      const { searchIds } = input;

      const requestedSearches = await db
        .select()
        .from(searches)
        .where(inArray(searches.id, searchIds));

      if (
        requestedSearches.some(({ createdBy }) => createdBy !== ctx.user.id)
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const hardDeleteSearches = await db
        .delete(searches)
        .where(
          and(
            inArray(searches.id, searchIds),
            eq(searches.createdBy, ctx.user.id),
          ),
        )
        .returning();

      return {
        success: true,
        searches: hardDeleteSearches,
      };
    }),

  editSearch: protectedProcedure
    .input(editSearchSchema())
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const [search] = await db
        .select()
        .from(searches)
        .where(eq(searches.id, id))
        .limit(1);

      if (search.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const [updatedSearch] = await db
        .update(searches)
        .set({
          ...('content' in input ? { content: input.content } : {}),
          ...('favorited' in input ? { favorited: input.favorited } : {}),
          ...('name' in input ? { name: input.name } : {}),
          updatedBy: ctx.user.id,
        })
        .where(eq(searches.id, id))
        .returning();

      return {
        success: true,
        search: updatedSearch,
      };
    }),

  searchNotes: protectedProcedure
    .input(searchNotesSchema())
    .query(async ({ input, ctx }) => {
      const query = db
        .select({
          note: notes,
        })
        .from(notes)
        .orderBy(desc(notes.updatedAt))
        .$dynamic();

      const [fieldFilters, tagFilters] = partition(
        input.query,
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
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Wrong type provided',
            });
        }
      }, query);

      const hasDeletedFilter = fieldFilters.some((f) => f.field === 'deleted');

      const allNotes = await queryFilteredByTag.where(
        and(
          ...[
            eq(notes.createdBy, ctx.user.id),
            ...(hasDeletedFilter ? [] : [isNull(notes.deletedAt)]),
            ...fieldFilters.map((filter) => {
              const where = whereFactory(filter.operator.type);
              const value = dayjs(filter.operator.value).toDate();

              switch (filter.field) {
                case 'deleted':
                  return where(notes.deletedAt, value);

                default:
                  throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Wrong filter provided',
                  });
              }
            }),
          ],
        ),
      );

      return {
        success: true,
        notes: allNotes.map(({ note }) => note),
      };
    }),

  softDeleteSearches: protectedProcedure
    .input(softDeleteSearchesSchema())
    .mutation(async ({ input, ctx }) => {
      const { searchIds } = input;

      const requestedSearches = await db
        .select()
        .from(searches)
        .where(inArray(searches.id, searchIds));

      if (
        requestedSearches.some(({ createdBy }) => createdBy !== ctx.user.id)
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const softDeleteSearches = await db
        .update(searches)
        .set({
          deletedAt: new Date(),
          deletedBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .where(
          and(
            inArray(searches.id, searchIds),
            eq(searches.createdBy, ctx.user.id),
          ),
        )
        .returning();

      return {
        success: true,
        searches: softDeleteSearches,
      };
    }),

  undoSoftDeletedSearches: protectedProcedure
    .input(undoSoftDeletedSearchesSchema())
    .mutation(async ({ input, ctx }) => {
      const { searchIds } = input;

      const requestedSearches = await db
        .select()
        .from(searches)
        .where(inArray(searches.id, searchIds));

      if (
        requestedSearches.some(({ createdBy }) => createdBy !== ctx.user.id)
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const restoredSoftDeleteSearches = await db
        .update(searches)
        .set({
          deletedAt: null,
          deletedBy: null,
          updatedBy: ctx.user.id,
        })
        .where(
          and(
            inArray(searches.id, searchIds),
            eq(searches.createdBy, ctx.user.id),
          ),
        )
        .returning();

      return {
        success: true,
        searches: restoredSoftDeleteSearches,
      };
    }),
});
