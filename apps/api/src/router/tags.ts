import { and, desc, eq } from 'drizzle-orm';

import { db, type TransactionType } from '@api/db';
import { notes, noteTags, tags } from '@api/db/schema';
import {
  createNoteTagSchema,
  createTagSchema,
  type CreateTagSchemaType,
  deleteNoteTagSchema,
  editNoteTagSchema,
  editTagSchema,
  findAllNoteTagsSchema,
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

  deleteNoteTag: protectedProcedure
    .input(deleteNoteTagSchema())
    .mutation(async ({ input, ctx }) => {
      const { tagId, noteId } = input;

      const [requestedNote] = await db
        .select()
        .from(notes)
        .where(eq(notes.id, noteId))
        .limit(1);

      if (requestedNote.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const [deletedNoteTag] = await db
        .delete(noteTags)
        .where(and(eq(noteTags.tagId, tagId), eq(noteTags.noteId, noteId)))
        .returning();

      return {
        success: true,
        noteTag: deletedNoteTag,
      };
    }),

  editNoteTag: protectedProcedure
    .input(editNoteTagSchema())
    .mutation(async ({ input, ctx }) => {
      const { tagId, noteId, value } = input;

      const [noteTag] = await db
        .select()
        .from(noteTags)
        .where(and(eq(noteTags.tagId, tagId), eq(noteTags.noteId, noteId)))
        .limit(1);

      if (noteTag.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const [tag] = await db
        .select()
        .from(tags)
        .where(eq(tags.id, tagId))
        .limit(1);

      return db.transaction(async (tx) => {
        const { type } = tag;

        // if string type, we need to update the tag name with the ne value
        if (type === 'string') {
          if (typeof value !== 'string') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Wrong `value` type provided',
            });
          }

          const [updatedTag] = await tx
            .update(tags)
            .set({
              name: value,
              updatedBy: ctx.user.id,
            })
            .where(eq(tags.id, tag.id))
            .returning();

          return {
            success: true,
            tag: updatedTag,
            noteTag,
          };
        }

        if (
          (type === 'date' && typeof value !== 'string') ||
          (type === 'boolean' && typeof value !== 'boolean') ||
          (type === 'number' && typeof value !== 'number')
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Wrong `value` type provided',
          });
        }

        const [updatedNoteTag] = await tx
          .update(noteTags)
          .set({
            valueBoolean:
              type === 'boolean' && typeof value === 'boolean' ? value : null,
            valueDate:
              type === 'date' && typeof value === 'string' ? value : null,
            valueNumber:
              type === 'number' && typeof value === 'number' ? value : null,
            updatedBy: ctx.user.id,
          })
          .where(and(eq(noteTags.tagId, tagId), eq(noteTags.noteId, noteId)))
          .returning();

        return {
          success: true,
          tag,
          noteTag: updatedNoteTag,
        };
      });
    }),

  findAllNoteTags: protectedProcedure
    .input(findAllNoteTagsSchema())
    .query(async ({ input, ctx }) => {
      const { noteId } = input;

      const [requestedNote] = await db
        .select()
        .from(notes)
        .where(eq(notes.id, noteId))
        .limit(1);

      if (requestedNote.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const queryResult = await db
        .select()
        .from(noteTags)
        .where(eq(noteTags.noteId, noteId))
        .innerJoin(tags, eq(noteTags.tagId, tags.id));

      const noteTagsResult = queryResult.reduce(
        (result, current) => {
          const { tags: tag, note_tags: noteTag } = current;
          const isStringType = tag.type === 'string';
          const value = (() => {
            switch (tag.type) {
              case 'string':
                return tag.name;
              case 'number':
                return noteTag.valueNumber;
              case 'boolean':
                return noteTag.valueBoolean;
              case 'date':
                return noteTag.valueDate;
              default:
                throw new TRPCError({
                  code: 'NOT_IMPLEMENTED',
                  message: 'Unsupported tag type found',
                });
            }
          })();

          return [
            ...result,
            {
              createdAt: isStringType ? tag.createdAt : noteTag.createdAt,
              name: tag.name,
              noteId: noteTag.noteId,
              tagId: noteTag.tagId,
              type: tag.type,
              updatedAt: isStringType ? tag.updatedAt : noteTag.updatedAt,
              value,
            },
          ];
        },
        [] as {
          createdAt: Date;
          name: string;
          type: 'string' | 'number' | 'boolean' | 'date';
          updatedAt: Date;
          value: string | number | boolean | null;
        }[],
      );

      return {
        success: true,
        noteTags: noteTagsResult,
      };
    }),
});
