import { and, desc, eq } from 'drizzle-orm';

import { db, type TransactionType } from '@api/db';
import { notes, noteTags, tags } from '@api/db/schema';
import {
  createNoteTagSchema,
  createTagSchema,
  type CreateTagSchemaType,
  editTagSchema,
} from '@api/schemas/tags';
import { protectedProcedure, router } from '@api/trpc';
import { TRPCError } from '@trpc/server';

const findOrCreateTag = async ({
  name,
  type,
  createdBy,
  updatedBy = createdBy,
  tx,
}: CreateTagSchemaType & {
  createdBy: string;
  updatedBy?: string;
  tx: TransactionType;
}) => {
  const [tag] = await tx
    .select()
    .from(tags)
    .where(and(eq(tags.name, name), eq(tags.type, type)));

  if (tag) {
    return tag;
  }

  const [newTag] = await tx
    .insert(tags)
    .values({
      name,
      type,
      createdBy,
      updatedBy,
    })
    .returning();

  return newTag;
};

export const tagsRouter = router({
  // --- TAGS ---
  createTag: protectedProcedure
    .input(createTagSchema())
    .mutation(async ({ input, ctx }) => {
      const { name, type } = input;

      const [newTag] = await db
        .insert(tags)
        .values({
          name,
          type,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .returning();

      return {
        success: true,
        tag: newTag,
      };
    }),

  editTag: protectedProcedure
    .input(editTagSchema())
    .mutation(async ({ input, ctx }) => {
      const { name, id } = input;

      const tag = (
        await db.select().from(tags).where(eq(tags.id, id)).limit(1)
      )[0];

      if (tag.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const [updatedTag] = await db
        .update(tags)
        .set({ name, updatedBy: ctx.user.id })
        .where(eq(tags.id, id))
        .returning();

      return {
        success: true,
        tag: updatedTag,
      };
    }),

  findAllTags: protectedProcedure.query(async ({ ctx }) => {
    const allTags = await db
      .select()
      .from(tags)
      .where(eq(tags.createdBy, ctx.user.id))
      .orderBy(desc(tags.updatedAt));

    return {
      success: true,
      tags: allTags,
    };
  }),

  // --- NOTE TAGS ---
  createNoteTag: protectedProcedure
    .input(createNoteTagSchema())
    .mutation(async ({ input, ctx }) => {
      const { name, noteId, type } = input;

      const [note] = await db
        .select()
        .from(notes)
        .where(eq(notes.id, noteId))
        .limit(1);

      if (note?.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      return db.transaction(async (tx) => {
        const tag = await findOrCreateTag({
          name,
          type,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
          tx,
        });

        const [newNoteTag] = await tx
          .insert(noteTags)
          .values({
            noteId,
            tagId: tag.id,
            valueBoolean: type === 'boolean' ? input.value : null,
            valueDate: type === 'date' ? input.value : null,
            valueNumber: type === 'number' ? input.value : null,
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          })
          .returning();

        return {
          success: true,
          tag,
          noteTag: newNoteTag,
        };
      });
    }),
});
