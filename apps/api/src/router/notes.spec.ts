import { reset } from 'drizzle-seed';
import { type Server } from 'http';
import supertest from 'supertest';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { type CreateNotesSchemaType } from '@api/schemas/notes';
import { startApp } from '@api/server';
import { createAndSignInUser } from '@api/tests/sessionUtils';

let app: Server | null = null;

beforeEach(() => {
  app = startApp({ port: 3001 });
});

afterEach(async () => {
  app?.close();
  await reset(db, schema);
});

test('notes.createNote should be correctly handled', async () => {
  expect((await db.select().from(schema.notes)).length).toBe(0);
  const { authCookie, user } = await createAndSignInUser(app!);

  const res = await supertest(app!)
    .post('/api/trpc/notes.createNote')
    .send({
      json: {
        content: 'Lorem Ipsum!',
      } satisfies CreateNotesSchemaType,
    })
    .set('Cookie', authCookie);

  expect(res.status).toBe(200);

  const createdNode = (await db.select().from(schema.notes).limit(1))[0];

  expect(createdNode.content).toBe('Lorem Ipsum!');
  expect(createdNode.createdAt).not.toBeNull();
  expect(createdNode.updatedAt).not.toBeNull();
  expect(createdNode.createdBy).toBe(user.id);
});

test('notes.createNote should be a protected route', async () => {
  expect((await db.select().from(schema.notes)).length).toBe(0);

  const res = await supertest(app!)
    .post('/api/trpc/notes.createNote')
    .send({
      json: {
        content: 'Lorem Ipsum!',
      } satisfies CreateNotesSchemaType,
    });

  expect(res.status).toBe(401);

  expect((await db.select().from(schema.notes)).length).toBe(0);
});
