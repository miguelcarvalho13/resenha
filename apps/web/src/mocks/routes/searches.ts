import { delay, http, type PathParams } from 'msw';

import {
  createTrpcJson,
  extractTrpcInput,
  type TrpcInput,
} from '@/mocks/factories/trpc';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { noteMock } from '../models/notes';
import { noteTagMock } from '../models/tags';
import { server } from '../server';

export const getSearchNotesHandler = ({ wait = 0 }: { wait?: number } = {}) => {
  http.get<PathParams, TrpcInput<RouterInput['searches']['searchNotes']>>(
    '/api/trpc/searches.searchNotes',
    async ({ request }) => {
      await delay(wait || server.timing);
      const input = extractTrpcInput(await request.clone().json());

      const notes = noteMock.all().filter((note) =>
        input.query.every((condition) => {
          !!noteTagMock.findFirst((q) =>
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
        }),
      );

      console.log();
      return createTrpcJson({
        success: true,
        notes,
      } satisfies RouterOutput['searches']['searchNotes']);
    },
  );
};
