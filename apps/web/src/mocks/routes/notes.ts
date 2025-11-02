import { delay, http, type PathParams } from 'msw';

import { createNoteMock } from '@/mocks/factories/notes';
import {
  createTrpcBatchJson,
  extractTrpcInput,
  type TrpcBatchInput,
} from '@/mocks/factories/trpc';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { noteMock } from '../models/notes';

export const postCreateNoteHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcBatchInput<RouterInput['notes']['createNote']>>(
    '/api/trpc/notes.createNote',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      return createTrpcBatchJson({
        success: true,
        note: await createNoteMock({
          content: input.content,
        }),
      } satisfies RouterOutput['notes']['createNote']);
    },
  );

export const postEditNoteHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcBatchInput<RouterInput['notes']['editNote']>>(
    '/api/trpc/notes.editNote',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      try {
        const updatedNote = await noteMock.update(
          (q) => q.where({ id: input.id }),
          {
            data(note) {
              note.content = input.content;
            },
          },
        );

        return createTrpcBatchJson({
          success: true,
          note: updatedNote!,
        } satisfies RouterOutput['notes']['editNote']);
      } catch (error) {
        console.log(error);
      }
    },
  );

export const getFindAllNotesHandler = () =>
  http.get('/api/trpc/notes.findAll', () =>
    createTrpcBatchJson({
      success: true,
      notes: noteMock.all(),
    } satisfies RouterOutput['notes']['findAll']),
  );
