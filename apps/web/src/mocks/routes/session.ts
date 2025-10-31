import { type Session, type User } from 'better-auth';
import { http, HttpResponse } from 'msw';

import { createSession } from '@/tests/factories/session';
import { createUser } from '@/tests/factories/user';

export const getSessionHandler = ({
  session = createSession(),
  user = createUser(),
}: {
  session?: Session;
  user?: User;
} = {}) =>
  http.get('/api/auth/get-session', () => HttpResponse.json({ session, user }));
