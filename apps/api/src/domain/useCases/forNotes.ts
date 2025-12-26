import type { ForNotesDriverPort } from '@api/domain/ports/driver/forNotes';

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

    if (!note || note.createdBy !== session.user.id) {
      throw new Error('!!');
    }

    return forUpdatingNotes.edit({ id, content, updatedBy: session.user.id });
  },

  findAll: async (session) =>
    forObtainingNotes.findAll({ where: { createdBy: session.user.id } }),

  hardDeleteNotes: async (ids, session) => {
    const requestedNotes = await forObtainingNotes.findAll({ where: { ids } });

    if (requestedNotes.some(({ createdBy }) => createdBy !== session.user.id)) {
      throw new Error('!!');
    }

    return forUpdatingNotes.hardDeleteNotes(ids);
  },

  softDeleteNotes: async (ids, session) => {
    const requestedNotes = await forObtainingNotes.findAll({ where: { ids } });

    if (requestedNotes.some(({ createdBy }) => createdBy !== session.user.id)) {
      throw new Error('!!');
    }

    return forUpdatingNotes.softDeleteNotes(ids, session.user.id);
  },

  undoDeleteNotes: async (ids, session) => {
    const requestedNotes = await forObtainingNotes.findAll({ where: { ids } });

    if (requestedNotes.some(({ createdBy }) => createdBy !== session.user.id)) {
      throw new Error('!!');
    }

    return forUpdatingNotes.undoDeleteNotes(ids, session.user.id);
  },
});
