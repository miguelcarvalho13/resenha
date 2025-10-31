import { delay, http } from 'msw';

import { type NoteTag } from '@/models/tags';
import { type RouterOutput } from '@/utils/trpc';
import { createTrpcBatchJson } from '@/tests/factories/trpc';

export const getFindAllNoteTagsHandler = ({
  noteTags = [],
  wait = 0,
}: {
  noteTags?: NoteTag[];
  wait?: number;
} = {}) =>
  http.get('/api/trpc/tags.findAllNoteTags', async () => {
    await delay(wait);

    return createTrpcBatchJson({
      success: true,
      noteTags,
    } satisfies RouterOutput['tags']['findAllNoteTags']);
  });

export const postCreateNoteTagHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post('/api/trpc/tags.createNoteTag', async () => {
    await delay(wait);
    return createTrpcBatchJson({});
  });

export const postDeleteNoteTagHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post('/api/trpc/tags.deleteNoteTag', async () => {
    await delay(wait);
    return createTrpcBatchJson({});
  });

export const postEditNoteTagHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post('/api/trpc/tags.editNoteTag', async () => {
    await delay(wait);
    return createTrpcBatchJson({});
  });
