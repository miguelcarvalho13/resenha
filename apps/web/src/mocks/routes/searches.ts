import dayjs from 'dayjs';
import { delay, http, type PathParams } from 'msw';

import {
  createTrpcJson,
  extractTrpcInputQuery,
  type TrpcInput,
} from '@/mocks/factories/trpc';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { utils as apiUtils } from '@repo/api';
import { noteMock } from '../models/notes';
import { noteTagMock } from '../models/tags';
import { server } from '../server';

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
                  value: (value) => {
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
