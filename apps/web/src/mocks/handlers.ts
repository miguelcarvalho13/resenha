import { type Session, type User } from 'better-auth';
import { http, HttpResponse } from 'msw';

import { type NoteForFindAll } from '@/models/notes';
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

export const postCreateNoteHandler = () =>
  http.post('/api/trpc/notes.createNote', () => createTrpcBatchJson({}));

export const postEditNoteHandler = () =>
  http.post('/api/trpc/notes.editNote', () => createTrpcBatchJson({}));

export const handlers = [
  http.get('https://api.example.com/user', () =>
    HttpResponse.json({
      id: 'abc-123',
      firstName: 'John',
      lastName: 'Maverick',
    }),
  ),
];
