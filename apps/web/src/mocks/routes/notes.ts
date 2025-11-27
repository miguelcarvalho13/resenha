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

export const postHardDeleteNotesHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['notes']['hardDeleteNotes']>>(
    '/api/trpc/notes.hardDeleteNotes',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      const hardDeletedNotes = noteMock.deleteMany((q) =>
        q.where({ id: (id) => input.noteIds.includes(id) }),
      );

      return createTrpcJson({
        success: true,
        notes: hardDeletedNotes,
      } satisfies RouterOutput['notes']['hardDeleteNotes']);
    },
  );

export const postSoftDeleteNotesHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['notes']['softDeleteNotes']>>(
    '/api/trpc/notes.softDeleteNotes',
    async ({ request }) => {
      await delay(wait);

      const input = extractTrpcInput(await request.clone().json());

      const softDeletedNotes = await noteMock.updateMany(
        (q) => q.where({ id: (id) => input.noteIds.includes(id) }),
        {
          data(note) {
            const now = new Date();
            note.deletedAt = now;
            note.deletedBy = note.createdBy;
            note.deletedByUser = note.createdByUser;
            note.updatedAt = now;
          },
        },
      );

      return createTrpcJson({
        success: true,
        notes: softDeletedNotes,
      } satisfies RouterOutput['notes']['softDeleteNotes']);
    },
  );

export const postUndoSoftDeletedNotesHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<
    PathParams,
    TrpcInput<RouterInput['notes']['undoSoftDeletedNotes']>
  >('/api/trpc/notes.undoSoftDeletedNotes', async ({ request }) => {
    await delay(wait);

    const input = extractTrpcInput(await request.clone().json());

    const restoredSoftDeleteNotes = await noteMock.updateMany(
      (q) => q.where({ id: (id) => input.noteIds.includes(id) }),
      {
        data(note) {
          note.deletedAt = null;
          note.deletedBy = null;
          note.deletedByUser = undefined;
          note.updatedAt = new Date();
        },
      },
    );

    return createTrpcJson({
      success: true,
      notes: restoredSoftDeleteNotes,
    } satisfies RouterOutput['notes']['undoSoftDeletedNotes']);
  });

export const getFindAllNotesHandler = () =>
  http.get('/api/trpc/notes.findAll', () =>
    createTrpcJson({
      success: true,
      notes: noteMock.all(),
    } satisfies RouterOutput['notes']['findAll']),
  );
