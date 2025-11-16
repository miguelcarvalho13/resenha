import { delay, http, type PathParams } from 'msw';

import { createNoteMock } from '@/mocks/factories/notes';
import {
  createTrpcJson,
  extractTrpcInput,
  type TrpcInput,
} from '@/mocks/factories/trpc';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { noteMock } from '../models/notes';

export const postCreateNoteHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['notes']['createNote']>>(
    '/api/trpc/notes.createNote',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      return createTrpcJson({
        success: true,
        note: await createNoteMock({
          content: input.content,
        }),
      } satisfies RouterOutput['notes']['createNote']);
    },
  );

export const postEditNoteHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['notes']['editNote']>>(
    '/api/trpc/notes.editNote',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      const updatedNote = await noteMock.update(
        (q) => q.where({ id: input.id }),
        {
          data(note) {
            note.content = input.content;
          },
        },
      );

      return createTrpcJson({
        success: true,
        note: updatedNote!,
      } satisfies RouterOutput['notes']['editNote']);
    },
  );

export const getFindAllNotesHandler = () =>
  http.get('/api/trpc/notes.findAll', () =>
    createTrpcJson({
      success: true,
      notes: noteMock.all(),
    } satisfies RouterOutput['notes']['findAll']),
  );
