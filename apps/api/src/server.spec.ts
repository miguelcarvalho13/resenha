import supertest from 'supertest';
import { describe, expect } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { DEFAULT_TEST_ENV_VARS, test } from '@api/tests/testExtend';
import { nanoid } from 'nanoid';

test('POST /api/auth/sign-up/email should be correctly handled', async ({
  app,
}) => {
  expect((await db.select().from(schema.users)).length).toBe(0);

  const res = await supertest(app!).post('/api/auth/sign-up/email').send({
    name: 'Some Name',
    email: 'some@example.com',
    password: 'SomePassword123@',
  });

  expect(res.status).toBe(200);

  expect((await db.select().from(schema.users)).length).toBe(1);
});

test('POST /api/auth/sign-in/email should fail if user does not exist', async ({
  app,
}) => {
  expect((await db.select().from(schema.users)).length).toBe(0);

  const res = await supertest(app!).post('/api/auth/sign-in/email').send({
    email: 'some@example.com',
    password: 'SomePassword123@',
  });

  expect(res.status).toBe(401);
});

test('POST /api/auth/sign-in/email should fail if user exists but incorrect credentials are sent', async ({
  app,
}) => {
  expect((await db.select().from(schema.users)).length).toBe(0);

  await supertest(app!).post('/api/auth/sign-up/email').send({
    name: 'Some Name',
    email: 'some@example.com',
    password: '12345678',
  });

  const res = await supertest(app!).post('/api/auth/sign-in/email').send({
    email: 'some@example.com',
    password: '1234567',
  });

  expect(res.status).toBe(401);
});

test('POST /api/auth/sign-in/email should succeed if user exists and correct credentials are sent', async ({
  app,
}) => {
  expect((await db.select().from(schema.users)).length).toBe(0);

  await supertest(app!).post('/api/auth/sign-up/email').send({
    name: 'Some Name',
    email: 'some@example.com',
    password: '12345678',
  });

  const res = await supertest(app!).post('/api/auth/sign-in/email').send({
    email: 'some@example.com',
    password: '12345678',
  });

  expect(res.status).toBe(200);
});

test('POST /api/auth/sign-out should be correctly handled', async ({ app }) => {
  expect((await db.select().from(schema.users)).length).toBe(0);

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

  const res = await supertest(app!)
    .post('/api/auth/sign-out')
    .send({
      email: 'some@example.com',
      password: '12345678',
    })
    .set('Cookie', authCookie);

  expect(res.status).toBe(200);
});

describe('FEATURE_ENABLE_EMAIL_SIGNUP=0', () => {
  test.scoped({
    env: {
      ...DEFAULT_TEST_ENV_VARS,
      FEATURE_ENABLE_EMAIL_SIGNUP: '0',
    },
  });

  test('POST /api/auth/sign-up/email should return an error', async ({
    app,
  }) => {
    expect((await db.select().from(schema.users)).length).toBe(0);

    const res = await supertest(app!).post('/api/auth/sign-up/email').send({
      name: 'Some Name',
      email: 'some@example.com',
      password: 'SomePassword123@',
    });

    expect(res.status).toBe(400);

    expect((await db.select().from(schema.users)).length).toBe(0);
  });
});

describe('FEATURE_ENABLE_INVITES=1', () => {
  test.scoped({
    env: {
      ...DEFAULT_TEST_ENV_VARS,
      FEATURE_ENABLE_INVITES: '1',
    },
  });

  test('POST /api/auth/sign-up/email should return an error if no invite is provided', async ({
    app,
  }) => {
    expect((await db.select().from(schema.users)).length).toBe(0);

    const res = await supertest(app!)
      .post('/api/auth/sign-up/email')
      .send({
        name: 'Some Name',
        email: 'some@example.com',
        password: 'SomePassword123@',
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);

    expect((await db.select().from(schema.users)).length).toBe(0);
  });

  test('POST /api/auth/sign-up/email should return an error if an invite code is provided but is not correct', async ({
    app,
  }) => {
    expect((await db.select().from(schema.users)).length).toBe(0);
    await db.insert(schema.invites).values({ code: nanoid() });

    const res = await supertest(app!)
      .post('/api/auth/sign-up/email')
      .send({
        name: 'Some Name',
        email: 'some@example.com',
        password: 'SomePassword123@',
        inviteCode: nanoid(),
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);

    expect((await db.select().from(schema.users)).length).toBe(0);
  });

  test('POST /api/auth/sign-up/email should return an error if an invite code is provided and is correct but already in use', async ({
    app,
  }) => {
    expect((await db.select().from(schema.users)).length).toBe(0);
    const code = nanoid();
    await db.insert(schema.invites).values({ code, usedAt: new Date() });

    const res = await supertest(app!)
      .post('/api/auth/sign-up/email')
      .send({
        name: 'Some Name',
        email: 'some@example.com',
        password: 'SomePassword123@',
        inviteCode: code,
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);

    expect((await db.select().from(schema.users)).length).toBe(0);
  });

  test('POST /api/auth/sign-up/email should return success if an invite code is correctly provided and not in use', async ({
    app,
  }) => {
    expect((await db.select().from(schema.users)).length).toBe(0);
    const code = nanoid();
    await db.insert(schema.invites).values({ code });

    const res = await supertest(app!)
      .post('/api/auth/sign-up/email')
      .send({
        name: 'Some Name',
        email: 'some@example.com',
        password: 'SomePassword123@',
        inviteCode: code,
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);

    expect((await db.select().from(schema.users)).length).toBe(1);
    expect((await db.select().from(schema.invites))[0].usedAt).toBeTruthy();

    // Sign-in should work as expected as well
    const signInResponse = await supertest(app!)
      .post('/api/auth/sign-in/email')
      .send({
        email: 'some@example.com',
        password: 'SomePassword123@',
      });

    expect(signInResponse.status).toBe(200);
  });

  test('POST /api/auth/sign-up/email should return error if an invite code is correctly provided but sign-up fails', async ({
    app,
  }) => {
    expect((await db.select().from(schema.users)).length).toBe(0);
    const code = nanoid();
    await db.insert(schema.invites).values({ code });

    const res = await supertest(app!)
      .post('/api/auth/sign-up/email')
      .send({
        name: 'Some Name',
        email: 'some@example.com',
        password: '1',
        inviteCode: code,
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);

    expect((await db.select().from(schema.users)).length).toBe(0);
    expect((await db.select().from(schema.invites))[0].usedAt).toBeFalsy();
  });
});
