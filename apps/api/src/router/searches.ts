import { and, desc, eq, gt, gte, lt, lte } from 'drizzle-orm';

import { db } from '@api/db';
import { notes, noteTags } from '@api/db/schema';
import { searchNotesSchema } from '@api/schemas/searches';
import { protectedProcedure, router } from '@api/trpc';
import { TRPCError } from '@trpc/server';
import { alias } from 'drizzle-orm/pg-core';

export const searchesRouter = router({
  searchNotes: protectedProcedure
    .input(searchNotesSchema())
    .query(async ({ input, ctx }) => {
      const query = db
        .select({
          note: notes,
        })
        .from(notes)
        .where(eq(notes.createdBy, ctx.user.id))
        .orderBy(desc(notes.updatedAt))
        .$dynamic();

      const filteredQuery = input.query.reduce((builder, q, index) => {
        const where = (() => {
          switch (q.operator.type) {
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
        })();

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

      const allNotes = await filteredQuery;

      return {
        success: true,
        notes: allNotes.map(({ note }) => note),
      };
    }),
});
