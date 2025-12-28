import dayjs from 'dayjs';
import { delay, http, type PathParams } from 'msw';

import {
  createTrpcJson,
  extractTrpcInput,
  extractTrpcInputQuery,
  type TrpcInput,
} from '@/mocks/factories/trpc';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { utils as apiUtils } from '@repo/api';
import { createSearchMock } from '../factories/searches';
import { noteMock } from '../models/notes';
import { searchMock } from '../models/searches';
import { noteTagMock, type NoteTagMockSchemaType } from '../models/tags';
import { server } from '../server';

export const postCreateSearchHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['searches']['createSearch']>>(
    '/api/trpc/searches.createSearch',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      return createTrpcJson({
        success: true,
        search: await createSearchMock({
          content: input.content,
        }),
      } satisfies RouterOutput['searches']['createSearch']);
    },
  );

export const postEditSearchHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['searches']['editSearch']>>(
    '/api/trpc/searches.editSearch',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      const updatedSearch = await searchMock.update(
        (q) => q.where({ id: input.id }),
        {
          data(search) {
            if ('content' in input && input.content) {
              search.content = input.content;
            }

            if ('favorited' in input && input.favorited !== undefined) {
              search.favorited = input.favorited;
            }

            if ('name' in input && input.name !== undefined) {
              search.name = input.name;
            }
          },
        },
      );

      return createTrpcJson({
        success: true,
        search: updatedSearch!,
      } satisfies RouterOutput['searches']['editSearch']);
    },
  );

export const postHardDeleteSearchesHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<
    PathParams,
    TrpcInput<RouterInput['searches']['hardDeleteSearches']>
  >('/api/trpc/searches.hardDeleteSearches', async ({ request }) => {
    await delay(wait);

    const input = extractTrpcInput(await request.clone().json());

    const hardDeletedSearches = searchMock.deleteMany((q) =>
      q.where({ id: (id) => input.searchIds.includes(id) }),
    );

    return createTrpcJson({
      success: true,
      searches: hardDeletedSearches,
    } satisfies RouterOutput['searches']['hardDeleteSearches']);
  });

export const postSoftDeleteSearchesHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<
    PathParams,
    TrpcInput<RouterInput['searches']['softDeleteSearches']>
  >('/api/trpc/searches.softDeleteSearches', async ({ request }) => {
    await delay(wait);

    const input = extractTrpcInput(await request.clone().json());

    const softDeletedSearches = await searchMock.updateMany(
      (q) => q.where({ id: (id) => input.searchIds.includes(id) }),
      {
        data(search) {
          const now = new Date();
          search.deletedAt = now;
          search.deletedBy = search.createdBy;
          search.deletedByUser = search.createdByUser;
          search.updatedAt = now;
        },
      },
    );

    return createTrpcJson({
      success: true,
      searches: softDeletedSearches,
    } satisfies RouterOutput['searches']['softDeleteSearches']);
  });

export const postUndoSoftDeletedSearchesHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<
    PathParams,
    TrpcInput<RouterInput['searches']['undoSoftDeletedSearches']>
  >('/api/trpc/searches.undoSoftDeletedSearches', async ({ request }) => {
    await delay(wait);

    const input = extractTrpcInput(await request.clone().json());

    const restoredSoftDeleteSearches = await searchMock.updateMany(
      (q) => q.where({ id: (id) => input.searchIds.includes(id) }),
      {
        data(search) {
          search.deletedAt = null;
          search.deletedBy = null;
          search.deletedByUser = undefined;
          search.updatedAt = new Date();
        },
      },
    );

    return createTrpcJson({
      success: true,
      searches: restoredSoftDeleteSearches,
    } satisfies RouterOutput['searches']['undoSoftDeletedSearches']);
  });

export const getFindAllSearchesHandler = () =>
  http.get('/api/trpc/searches.findAllSearches', () =>
    createTrpcJson({
      success: true,
      searches: searchMock.findMany((q) => q.where({ deletedAt: null })),
    } satisfies RouterOutput['searches']['findAllSearches']),
  );

export const getFindSearchByIdHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.get<PathParams, TrpcInput<RouterInput['searches']['findSearchById']>>(
    '/api/trpc/searches.findSearchById',
    async ({ request }) => {
      await delay(wait || server.timing);

      const input = extractTrpcInputQuery<
        RouterInput['searches']['findSearchById']
      >(request.url);

      const search = searchMock.findFirst((q) =>
        q.where({ id: input.searchId }),
      );

      if (!search) {
        throw new Error('[msw] Search not found');
      }

      return createTrpcJson({
        success: true,
        search,
      } satisfies RouterOutput['searches']['findSearchById']);
    },
  );

export const getSearchNotesHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.get<PathParams, TrpcInput<RouterInput['searches']['searchNotes']>>(
    '/api/trpc/searches.searchNotes',
    async ({ request }) => {
      await delay(wait || server.timing);

      const input = extractTrpcInputQuery<
        RouterInput['searches']['searchNotes']
      >(request.url);

      const [fieldFilters, tagFilters] = apiUtils.partition(
        input.query,
        (filter) => 'field' in filter,
      );

      const hasDeletedFilter = fieldFilters.some((f) => f.field === 'deleted');

      const notes = noteMock
        .all()
        .filter((note) => {
          if (!hasDeletedFilter) {
            return !note.deletedAt;
          }

          return fieldFilters.every((filter) => {
            const value = dayjs(filter.operator.value).toDate();
            const noteValue = {
              deleted: note.deletedAt,
            }[filter.field];

            if (!noteValue) return false;

            switch (filter.operator.type) {
              case '=':
                return noteValue.getTime() === value.getTime();
              case '<':
                return noteValue < value;
              case '<=':
                return noteValue <= value;
              case '>':
                return noteValue > value;
              case '>=':
                return noteValue >= value;

              default:
                return false;
            }
          });
        })
        .filter((note) =>
          tagFilters.every((condition) => {
            const matchedNoteTag = noteTagMock.findFirst((q) =>
              q.and(
                q.where({ noteId: note.id }),
                q.where({ tagId: condition.tagId }),
                q.where({
                  value: (value: NoteTagMockSchemaType['value']) => {
                    switch (condition.operator.type) {
                      case '=':
                        return 'value' in condition.operator
                          ? value === condition.operator.value
                          : true;
                      case '<':
                        return value < condition.operator.value;
                      case '<=':
                        return value <= condition.operator.value;
                      case '>':
                        return value > condition.operator.value;
                      case '>=':
                        return value >= condition.operator.value;
                    }
                  },
                }),
              ),
            );

            return !!matchedNoteTag;
          }),
        );

      return createTrpcJson({
        success: true,
        notes,
      } satisfies RouterOutput['searches']['searchNotes']);
    },
  );
