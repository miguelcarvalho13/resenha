import {
  createSearchSchema,
  editSearchSchema,
  findSearchByIdSchema,
  hardDeleteSearchesSchema,
  searchNotesSchema,
  softDeleteSearchesSchema,
  undoSoftDeletedSearchesSchema,
} from '@api/adapters/driver/trpc/forSearchesTrpcInput';
import type { DriverContext } from '@api/domain/context';
import { protectedProcedure, router } from '@api/trpc';
import { onError } from './trpcError';

export const searchesRouter = ({
  forSearches,
  forNotes,
}: Pick<DriverContext, 'forSearches' | 'forNotes'>) =>
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
        const notes = await forNotes.findAllBySearch(input, ctx).catch(onError);

        return {
          success: true,
          notes,
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
