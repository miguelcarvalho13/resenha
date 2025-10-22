import { desc, eq } from 'drizzle-orm';

import { db } from '@api/db';
import { tags } from '@api/db/schema';
import { createTagSchema, editTagSchema } from '@api/schemas/tags';
import { protectedProcedure, router } from '@api/trpc';
import { TRPCError } from '@trpc/server';

export const tagsRouter = router({
  createTag: protectedProcedure
    .input(createTagSchema())
    .mutation(async ({ input, ctx }) => {
      const { name, type } = input;

      const newTag = await db.insert(tags).values({
        name,
        type,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
      });

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

      const updatedTag = await db
        .update(tags)
        .set({ name, updatedBy: ctx.user.id })
        .where(eq(tags.id, id));

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
});
