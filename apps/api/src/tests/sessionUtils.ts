import { type Server } from 'http';
import supertest from 'supertest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { eq } from 'drizzle-orm';

export const createUser = async (
  app: Server,
  {
    name = 'Some Name',
    email = 'some@example.com',
    password = '12345678',
  }: {
    name?: string;
    email?: string;
    password?: string;
  } = {},
) => {
  await supertest(app!).post('/api/auth/sign-up/email').send({
    name,
    email,
    password,
  });

  const user = (
    await db.select().from(schema.users).where(eq(schema.users.email, email))
  )[0];

  return user;
};

/**
 * Test helper to create a user and sign in with it. Specially useful for
 * returning the cookie to be used in future request calls.
 */
export const createAndSignInUser = async (app: Server) => {
  const user = await createUser(app, {
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

  return { authCookie, user };
};
