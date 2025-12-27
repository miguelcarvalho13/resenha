import {
  createNoteSchema,
  editNoteSchema,
  hardDeleteNotesSchema,
  softDeleteNotesSchema,
  undoSoftDeletedNotesSchema,
} from '@api/adapters/driver/forNotesTrpcInputs';
import type { DriverContext } from '@api/domain/context';
import { protectedProcedure, router } from '@api/trpc';
import { onError } from './trpcError';

export const notesRouter = ({ forNotes }: Pick<DriverContext, 'forNotes'>) =>
  router({
    createNote: protectedProcedure
      .input(createNoteSchema())
      .mutation(async ({ input, ctx }) => {
        const { content } = input;
        const note = await forNotes.create({ content }, ctx).catch(onError);

        return {
          success: true,
          note,
        };
      }),

    editNote: protectedProcedure
      .input(editNoteSchema())
      .mutation(async ({ input, ctx }) => {
        const { content, id } = input;
        const note = await forNotes.edit({ id, content }, ctx).catch(onError);

        return {
          success: true,
          note,
        };
      }),

    findAll: protectedProcedure.query(async ({ ctx }) => {
      const notes = await forNotes.findAll(ctx).catch(onError);

      return {
        success: true,
        notes,
      };
    }),

    hardDeleteNotes: protectedProcedure
      .input(hardDeleteNotesSchema())
      .mutation(async ({ input, ctx }) => {
        const { noteIds } = input;
        const notes = await forNotes
          .hardDeleteNotes(noteIds, ctx)
          .catch(onError);

        return {
          success: true,
          notes,
        };
      }),

    softDeleteNotes: protectedProcedure
      .input(softDeleteNotesSchema())
      .mutation(async ({ input, ctx }) => {
        const { noteIds } = input;
        const notes = await forNotes
          .softDeleteNotes(noteIds, ctx)
          .catch(onError);

        return {
          success: true,
          notes,
        };
      }),

    undoSoftDeletedNotes: protectedProcedure
      .input(undoSoftDeletedNotesSchema())
      .mutation(async ({ input, ctx }) => {
        const { noteIds } = input;
        const notes = await forNotes
          .undoDeleteNotes(noteIds, ctx)
          .catch(onError);

        return {
          success: true,
          notes,
        };
      }),
  });
