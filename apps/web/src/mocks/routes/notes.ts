import { delay, http } from 'msw';

import { type NoteForFindAll } from '@/models/notes';
import { createTrpcBatchJson } from '@/tests/factories/trpc';
import { type RouterOutput } from '@/utils/trpc';

export const postCreateNoteHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post('/api/trpc/notes.createNote', async () => {
    await delay(wait);
    return createTrpcBatchJson({});
  });

export const postEditNoteHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post('/api/trpc/notes.editNote', async () => {
    await delay(wait);
    return createTrpcBatchJson({});
  });

export const getFindAllNotesHandler = ({
  notes = [],
}: {
  notes?: NoteForFindAll[];
} = {}) =>
  http.get('/api/trpc/notes.findAll', () =>
    createTrpcBatchJson({
      success: true,
      notes,
    } satisfies RouterOutput['notes']['findAll']),
  );
