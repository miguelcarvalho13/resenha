import { AppError, ERROR_CODES } from '@api/domain/entities/errors';
import type { ForSearchesDriverPort } from '@api/domain/ports/driver/forSearches';

export const forSearchesUseCase: ForSearchesDriverPort = ({
  forStoringSearches,
}) => ({
  create: async ({ content }, session) =>
    forStoringSearches.create({
      content,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    }),

  edit: async ({ id, content, favorited, name }, session) => {
    const search = await forStoringSearches.findOne({ id });

    if (!search) {
      throw new AppError('Search not found', ERROR_CODES.SEARCH_NOT_FOUND);
    }

    if (search.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringSearches.edit({
      id,
      content,
      favorited,
      name,
      updatedBy: session.user.id,
    });
  },

  findOne: async (id, session) => {
    const search = await forStoringSearches.findOne({ id });

    if (!search) {
      throw new AppError('Search not found', ERROR_CODES.SEARCH_NOT_FOUND);
    }

    if (search.createdBy !== session.user.id) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return search;
  },

  findAll: async (session) =>
    forStoringSearches.findAll({ where: { createdBy: session.user.id } }),

  hardDelete: async (ids, session) => {
    const requestedSearches = await forStoringSearches.findAll({
      where: { ids },
    });

    if (
      requestedSearches.some(({ createdBy }) => createdBy !== session.user.id)
    ) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringSearches.hardDelete(ids);
  },

  softDelete: async (ids, session) => {
    const requestedSearches = await forStoringSearches.findAll({
      where: { ids },
    });

    if (
      requestedSearches.some(({ createdBy }) => createdBy !== session.user.id)
    ) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringSearches.softDelete(ids, session.user.id);
  },

  undoDelete: async (ids, session) => {
    const requestedSearches = await forStoringSearches.findAll({
      where: { ids },
    });

    if (
      requestedSearches.some(({ createdBy }) => createdBy !== session.user.id)
    ) {
      throw new AppError(
        'Not enough privileges',
        ERROR_CODES.NOT_ENOUGH_PRIVILEGES,
      );
    }

    return forStoringSearches.undoDelete(ids, session.user.id);
  },
});
