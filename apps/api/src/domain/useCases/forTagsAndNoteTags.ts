import { invariant, isBoolean, isString } from 'es-toolkit';

import { AppError, ERROR_CODES } from '@api/domain/entities/errors';
import { TAG_TYPES } from '@api/domain/entities/tagTypes';
import type { ForTagsAndNoteTagsDriverPort } from '@api/domain/ports/driver/forTagsAndNoteTags';

export const forTagsAndNoteTagsUseCase: ForTagsAndNoteTagsDriverPort = ({
  forObtainingNotes,
  forStoringTagsAndNoteTags,
}) => ({
  // Tags
  createTag: async ({ name, type }, session) =>
    forStoringTagsAndNoteTags.createTag({
      name,
      type,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    }),

  editTag: async ({ id, name }, session) => {
    const tag = await forStoringTagsAndNoteTags.findOneTag({ id });

    if (!tag) {
      throw new AppError('Tag not found', ERROR_CODES.TAG_NOT_FOUND);
    }

    if (tag.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringTagsAndNoteTags.editTag({
      id,
      name,
      updatedBy: session.user.id,
    });
  },

  findAllTags: async (session) =>
    forStoringTagsAndNoteTags.findAllTags({
      where: { createdBy: session.user.id },
    }),

  findOneTag: async ({ id }, session) =>
    forStoringTagsAndNoteTags.findOneTag({
      id,
      createdBy: session.user.id,
    }),

  // NoteTags
  createNoteTag: async ({ name, noteId, type, value }, session) => {
    const note = await forObtainingNotes.findOne(noteId);

    if (note?.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringTagsAndNoteTags.atomic(async (port) => {
      // If the tag already exists, it uses the existent one, otherwise creates a new one.
      const tag =
        (await port.findOneTag({ name, type, createdBy: session.user.id })) ??
        (await port.createTag({
          name,
          type,
          createdBy: session.user.id,
          updatedBy: session.user.id,
        }));

      const common = {
        noteId: note.id,
        tagId: tag.id,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      };

      switch (type) {
        case TAG_TYPES.STRING:
          return port.createNoteTag({ ...common, type, value });
        case TAG_TYPES.BOOLEAN:
          return port.createNoteTag({ ...common, type, value });
        case TAG_TYPES.DATE:
          return port.createNoteTag({ ...common, type, value });
        case TAG_TYPES.NUMBER:
          return port.createNoteTag({ ...common, type, value });

        default:
          throw new AppError(
            'Wrong value provided',
            ERROR_CODES.TAG_WRONG_VALUE_PROVIDED,
          );
      }
    });
  },

  deleteNoteTag: async ({ noteId, tagId }, session) => {
    const note = await forObtainingNotes.findOne(noteId);

    if (note?.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringTagsAndNoteTags.deleteNoteTag({ noteId, tagId });
  },

  editNoteTag: async ({ noteId, tagId, value }, session) => {
    const note = await forObtainingNotes.findOne(noteId);

    if (note?.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringTagsAndNoteTags.atomic(async (port) => {
      const tag = await port.findOneTag({ id: tagId });

      if (!tag) {
        throw new AppError('Tag not found', ERROR_CODES.TAG_NOT_FOUND);
      }

      const { type } = tag;

      if (type === 'string') {
        if (typeof value !== 'string') {
          throw new AppError(
            'Wrong value provided',
            ERROR_CODES.TAG_WRONG_VALUE_PROVIDED,
          );
        }

        // If it's a string tag we need to update the tag itself and not the noteTag
        await port.editTag({
          id: tagId,
          name: value,
          updatedBy: session.user.id,
        });

        const noteTag = await port.findOneNoteTag({ noteId, tagId });

        if (!noteTag) {
          throw new AppError(
            'NoteTag not found',
            ERROR_CODES.NOTE_TAG_NOT_FOUND,
          );
        }

        return noteTag;
      }

      const common = {
        noteId,
        tagId,
        updatedBy: session.user.id,
      };

      switch (type) {
        case TAG_TYPES.BOOLEAN:
          invariant(
            isBoolean(value),
            new AppError(
              'Wrong value provided',
              ERROR_CODES.TAG_WRONG_VALUE_PROVIDED,
            ),
          );
          return port.editNoteTag({ ...common, type, value });
        case TAG_TYPES.DATE:
          invariant(
            isString(value),
            new AppError(
              'Wrong value provided',
              ERROR_CODES.TAG_WRONG_VALUE_PROVIDED,
            ),
          );
          return port.editNoteTag({ ...common, type, value });
        case TAG_TYPES.NUMBER:
          invariant(
            typeof value === 'number',
            new AppError(
              'Wrong value provided',
              ERROR_CODES.TAG_WRONG_VALUE_PROVIDED,
            ),
          );
          return port.editNoteTag({ ...common, type, value });

        default:
          throw new AppError(
            'Wrong value provided',
            ERROR_CODES.TAG_WRONG_VALUE_PROVIDED,
          );
      }
    });
  },

  findAllNoteTags: async ({ noteId }, session) => {
    const note = await forObtainingNotes.findOne(noteId);

    if (note?.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringTagsAndNoteTags.findAllNoteTags({
      where: { createdBy: session.user.id, noteIds: [noteId] },
    });
  },
});
