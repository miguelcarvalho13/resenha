import { http, HttpResponse } from 'msw';

import { sessionMock } from '../models/sessions';

export const getSessionHandler = () =>
  http.get('/api/auth/get-session', () => {
    const session = sessionMock.findFirst();

    if (!session) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ session, user: session.user });
  });

export const postSignUpWithEmail = () =>
  http.post(
    '/api/auth/sign-up/email',
    () => new HttpResponse(null, { status: 201 }),
  );

export const postSignInWithEmail = () =>
  http.post(
    '/api/auth/sign-in/email',
    () => new HttpResponse(null, { status: 200 }),
  );
export const postSignOut = () =>
  http.post(
    '/api/auth/sign-out',
    () => new HttpResponse(null, { status: 200 }),
  );
