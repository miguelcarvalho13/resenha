import type { ForNotesDriverPort } from '@api/domain/ports/driver/forNotes';
import { AppError, ERROR_CODES } from '@api/domain/entities/errors';

export const forNotesUseCase: ForNotesDriverPort = ({
  forObtainingNotes,
  forUpdatingNotes,
}) => ({
  create: async ({ content }, session) =>
    forUpdatingNotes.create({
      content,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    }),

  edit: async ({ id, content }, session) => {
    const note = await forObtainingNotes.findOne(id);

    if (!note) {
      throw new AppError('Note not found', ERROR_CODES.NOTE_NOT_FOUND);
    }

    if (note.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forUpdatingNotes.edit({ id, content, updatedBy: session.user.id });
  },

  findAll: async (session) =>
    forObtainingNotes.findAll({ where: { createdBy: session.user.id } }),

  hardDeleteNotes: async (ids, session) => {
    const requestedNotes = await forObtainingNotes.findAll({ where: { ids } });

    if (requestedNotes.some(({ createdBy }) => createdBy !== session.user.id)) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forUpdatingNotes.hardDeleteNotes(ids);
  },

  softDeleteNotes: async (ids, session) => {
    const requestedNotes = await forObtainingNotes.findAll({ where: { ids } });

    if (requestedNotes.some(({ createdBy }) => createdBy !== session.user.id)) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forUpdatingNotes.softDeleteNotes(ids, session.user.id);
  },

  undoDeleteNotes: async (ids, session) => {
    const requestedNotes = await forObtainingNotes.findAll({ where: { ids } });

    if (requestedNotes.some(({ createdBy }) => createdBy !== session.user.id)) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forUpdatingNotes.undoDeleteNotes(ids, session.user.id);
  },
});
