import { db } from '@api/db';
import { notes } from '@api/db/schema';
import { createNotesSchema } from '@api/schemas/notes';
import { protectedProcedure, router } from '@api/trpc';

export const notesRouter = router({
  createNote: protectedProcedure
    .input(createNotesSchema())
    .mutation(async ({ input, ctx }) => {
      const { content } = input;

      const newNote = await db.insert(notes).values({
        content,
        createdBy: ctx.user.id,
      });

      return {
        success: true,
        note: newNote,
      };
    }),
});
