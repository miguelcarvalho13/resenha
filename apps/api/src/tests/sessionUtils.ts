import { type Server } from 'http';
import supertest from 'supertest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Test helper to create a user and sign in with it. Specially useful for
 * returning the cookie to be used in future request calls.
 */
export const createAndSignInUser = async (app: Server) => {
  await supertest(app!).post('/api/auth/sign-up/email').send({
    name: 'Some Name',
    email: 'some@example.com',
    password: '12345678',
  });

  const signInResponse = await supertest(app!)
    .post('/api/auth/sign-in/email')
    .send({
      email: 'some@example.com',
      password: '12345678',
    });

  const authCookie = signInResponse.headers['set-cookie'];
  const user = (
    await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'some@example.com'))
  )[0];

  return { authCookie, user };
};
