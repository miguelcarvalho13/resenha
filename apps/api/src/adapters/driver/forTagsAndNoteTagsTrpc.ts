import {
  createNoteTagSchema,
  createTagSchema,
  deleteNoteTagSchema,
  editNoteTagSchema,
  editTagSchema,
  findAllNoteTagsSchema,
} from '@api/adapters/driver/forTagsAndNoteTagsTrpcInput';
import type { DriverContext } from '@api/domain/context';
import { TAG_TYPES } from '@api/domain/entities/tagTypes';
import { protectedProcedure, router } from '@api/trpc';
import { onError } from './trpcError';

export const tagsRouter = ({
  forTagsAndNoteTags,
}: Pick<DriverContext, 'forTagsAndNoteTags'>) =>
  router({
    // --- TAGS ---
    createTag: protectedProcedure
      .input(createTagSchema())
      .mutation(async ({ input, ctx }) => {
        const { name, type } = input;
        const tag = await forTagsAndNoteTags
          .createTag({ name, type }, ctx)
          .catch(onError);

        return {
          success: true,
          tag,
        };
      }),

    editTag: protectedProcedure
      .input(editTagSchema())
      .mutation(async ({ input, ctx }) => {
        const { name, id } = input;
        const tag = await forTagsAndNoteTags
          .editTag({ id, name }, ctx)
          .catch(onError);

        return {
          success: true,
          tag,
        };
      }),

    findAllTags: protectedProcedure.query(async ({ ctx }) => {
      const tags = await forTagsAndNoteTags.findAllTags(ctx).catch(onError);

      return {
        success: true,
        tags,
      };
    }),

    // --- NOTE TAGS ---
    createNoteTag: protectedProcedure
      .input(createNoteTagSchema())
      .mutation(async ({ input, ctx }) => {
        const { name, noteId, type } = input;

        const noteTag = await (() => {
          switch (type) {
            case TAG_TYPES.STRING:
              return forTagsAndNoteTags.createNoteTag(
                { name, noteId, type, value: name },
                ctx,
              );

            case TAG_TYPES.BOOLEAN:
              return forTagsAndNoteTags.createNoteTag(
                { name, noteId, type, value: input.value },
                ctx,
              );

            case TAG_TYPES.DATE:
              return forTagsAndNoteTags.createNoteTag(
                { name, noteId, type, value: input.value },
                ctx,
              );

            case TAG_TYPES.NUMBER:
              return forTagsAndNoteTags.createNoteTag(
                { name, noteId, type, value: input.value },
                ctx,
              );

            default:
              throw new Error('Unsupported type');
          }
        })().catch(onError);

        return {
          success: true,
          noteTag,
          tag: await forTagsAndNoteTags.findOneTag({ id: noteTag.tagId }, ctx),
        };
      }),

    deleteNoteTag: protectedProcedure
      .input(deleteNoteTagSchema())
      .mutation(async ({ input, ctx }) => {
        const { tagId, noteId } = input;
        const noteTag = await forTagsAndNoteTags
          .deleteNoteTag({ noteId, tagId }, ctx)
          .catch(onError);

        return {
          success: true,
          noteTag,
        };
      }),

    editNoteTag: protectedProcedure
      .input(editNoteTagSchema())
      .mutation(async ({ input, ctx }) => {
        const { tagId, noteId, value } = input;
        const noteTag = await forTagsAndNoteTags
          .editNoteTag({ noteId, tagId, value }, ctx)
          .catch(onError);

        return {
          success: true,
          noteTag,
          tag: await forTagsAndNoteTags.findOneTag({ id: tagId }, ctx),
        };
      }),

    findAllNoteTags: protectedProcedure
      .input(findAllNoteTagsSchema())
      .query(async ({ input, ctx }) => {
        const { noteId } = input;
        const noteTags = await forTagsAndNoteTags
          .findAllNoteTags({ noteId }, ctx)
          .catch(onError);

        return {
          success: true,
          noteTags,
        };
      }),
  });
