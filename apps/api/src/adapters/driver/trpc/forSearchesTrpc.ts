import dayjs from 'dayjs';
import { and, desc, eq, gt, gte, isNull, lt, lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import {
  createSearchSchema,
  editSearchSchema,
  findSearchByIdSchema,
  hardDeleteSearchesSchema,
  searchNotesSchema,
  softDeleteSearchesSchema,
  undoSoftDeletedSearchesSchema,
} from '@api/adapters/driver/trpc/forSearchesTrpcInput';
import { db } from '@api/db';
import { notes, noteTags } from '@api/db/schema';
import type { DriverContext } from '@api/domain/context';
import { type DateOperatorsType } from '@api/domain/entities/searches';
import { protectedProcedure, router } from '@api/trpc';
import { partition } from '@api/utils/array';
import { TRPCError } from '@trpc/server';
import { onError } from './trpcError';

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

export const searchesRouter = ({
  forSearches,
}: Pick<DriverContext, 'forSearches'>) =>
  router({
    createSearch: protectedProcedure
      .input(createSearchSchema())
      .mutation(async ({ input, ctx }) => {
        const { content } = input;
        const search = await forSearches
          .create({ content }, ctx)
          .catch(onError);

        return {
          success: true,
          search,
        };
      }),

    findAllSearches: protectedProcedure.query(async ({ ctx }) => {
      const searches = await forSearches.findAll(ctx).catch(onError);

      return {
        success: true,
        searches,
      };
    }),

    findSearchById: protectedProcedure
      .input(findSearchByIdSchema())
      .query(async ({ ctx, input }) => {
        const search = await forSearches
          .findOne(input.searchId, ctx)
          .catch(onError);

        return {
          success: true,
          search,
        };
      }),

    hardDeleteSearches: protectedProcedure
      .input(hardDeleteSearchesSchema())
      .mutation(async ({ input, ctx }) => {
        const { searchIds } = input;
        const searches = await forSearches
          .hardDelete(searchIds, ctx)
          .catch(onError);

        return {
          success: true,
          searches,
        };
      }),

    editSearch: protectedProcedure
      .input(editSearchSchema())
      .mutation(async ({ input, ctx }) => {
        const { id, ...remainingInput } = input;
        const search = await forSearches
          .edit({ id, ...remainingInput }, ctx)
          .catch(onError);

        return {
          success: true,
          search,
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

        const hasDeletedFilter = fieldFilters.some(
          (f) => f.field === 'deleted',
        );

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
        const searches = await forSearches
          .softDelete(searchIds, ctx)
          .catch(onError);

        return {
          success: true,
          searches,
        };
      }),

    undoSoftDeletedSearches: protectedProcedure
      .input(undoSoftDeletedSearchesSchema())
      .mutation(async ({ input, ctx }) => {
        const { searchIds } = input;
        const searches = await forSearches
          .undoDelete(searchIds, ctx)
          .catch(onError);

        return {
          success: true,
          searches,
        };
      }),
  });
