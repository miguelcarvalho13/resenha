import { type Session, type User } from 'better-auth';
import { delay, http, HttpResponse } from 'msw';

import { type NoteForFindAll } from '@/models/notes';
import { type NoteTag } from '@/models/tags';
import { createSession } from '@/tests/factories/session';
import { createTrpcBatchJson } from '@/tests/factories/trpc';
import { createUser } from '@/tests/factories/user';
import { type RouterOutput } from '@/utils/trpc';

export const getSessionHandler = ({
  session = createSession(),
  user = createUser(),
}: {
  session?: Session;
  user?: User;
} = {}) =>
  http.get('/api/auth/get-session', () => HttpResponse.json({ session, user }));

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

export const handlers = [
  http.get('https://api.example.com/user', () =>
    HttpResponse.json({
      id: 'abc-123',
      firstName: 'John',
      lastName: 'Maverick',
    }),
  ),
];
