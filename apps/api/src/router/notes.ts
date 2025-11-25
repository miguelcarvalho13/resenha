import { and, desc, eq, inArray } from 'drizzle-orm';

import { db } from '@api/db';
import { notes } from '@api/db/schema';
import {
  createNoteSchema,
  editNoteSchema,
  hardDeleteNotesSchema,
  softDeleteNotesSchema,
} from '@api/schemas/notes';
import { protectedProcedure, router } from '@api/trpc';
import { TRPCError } from '@trpc/server';

export const notesRouter = router({
  createNote: protectedProcedure
    .input(createNoteSchema())
    .mutation(async ({ input, ctx }) => {
      const { content } = input;

      const [newNote] = await db
        .insert(notes)
        .values({
          content,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .returning();

      return {
        success: true,
        note: newNote,
      };
    }),

  editNote: protectedProcedure
    .input(editNoteSchema())
    .mutation(async ({ input, ctx }) => {
      const { content, id } = input;

      const note = (
        await db.select().from(notes).where(eq(notes.id, id)).limit(1)
      )[0];

      if (note.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const [updatedNote] = await db
        .update(notes)
        .set({ content, updatedBy: ctx.user.id })
        .where(eq(notes.id, id))
        .returning();

      return {
        success: true,
        note: updatedNote,
      };
    }),

  findAll: protectedProcedure.query(async ({ ctx }) => {
    const allNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.createdBy, ctx.user.id))
      .orderBy(desc(notes.updatedAt));

    return {
      success: true,
      notes: allNotes,
    };
  }),

  hardDeleteNotes: protectedProcedure
    .input(hardDeleteNotesSchema())
    .mutation(async ({ input, ctx }) => {
      const { noteIds } = input;

      const requestedNotes = await db
        .select()
        .from(notes)
        .where(inArray(notes.id, noteIds));

      if (requestedNotes.some(({ createdBy }) => createdBy !== ctx.user.id)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const hardDeleteNotes = await db
        .delete(notes)
        .where(
          and(inArray(notes.id, noteIds), eq(notes.createdBy, ctx.user.id)),
        )
        .returning();

      return {
        success: true,
        notes: hardDeleteNotes,
      };
    }),

  softDeleteNotes: protectedProcedure
    .input(softDeleteNotesSchema())
    .mutation(async ({ input, ctx }) => {
      const { noteIds } = input;

      const requestedNotes = await db
        .select()
        .from(notes)
        .where(inArray(notes.id, noteIds));

      if (requestedNotes.some(({ createdBy }) => createdBy !== ctx.user.id)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const softDeleteNotes = await db
        .update(notes)
        .set({
          deletedAt: new Date(),
          deletedBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .where(
          and(inArray(notes.id, noteIds), eq(notes.createdBy, ctx.user.id)),
        )
        .returning();

      return {
        success: true,
        notes: softDeleteNotes,
      };
    }),
});
