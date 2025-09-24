import { createSession } from '@/tests/factories/session';
import { createUser } from '@/tests/factories/user';
import { type Session, type User } from 'better-auth';
import { http, HttpResponse } from 'msw';

export const getSessionHandler = ({
  session = createSession(),
  user = createUser(),
}: {
  session?: Session;
  user?: User;
} = {}) =>
  http.get('/api/auth/get-session', () => HttpResponse.json({ session, user }));

export const handlers = [
  http.get('https://api.example.com/user', () =>
    HttpResponse.json({
      id: 'abc-123',
      firstName: 'John',
      lastName: 'Maverick',
    }),
  ),
];
