import { eq } from 'drizzle-orm';
import { reset } from 'drizzle-seed';
import { type Server } from 'http';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { type CreateNotesSchemaType } from '@api/schemas/notes';
import { startApp } from '@api/server';
import { createAndSignInUser, createUser } from '@api/tests/sessionUtils';

let app: Server | null = null;

beforeEach(() => {
  app = startApp({ port: 3001 });
});

afterEach(async () => {
  app?.close();
  await reset(db, schema);
});

describe('notes.createNote', () => {
  test('should be correctly handled', async () => {
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

  test('should be a protected route', async () => {
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
});

describe('notes.findAll', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    // First creates a note for the user
    await supertest(app!)
      .post('/api/trpc/notes.createNote')
      .send({
        json: {
          content: 'Lorem Ipsum!',
        } satisfies CreateNotesSchemaType,
      })
      .set('Cookie', authCookie);

    const res = await supertest(app!)
      .get('/api/trpc/notes.findAll')
      .set('Cookie', authCookie);

    console.log(JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);

    const allNotes = await db.select().from(schema.notes);
    expect(res.body.result.data.json.notes).to.deep.equal([
      {
        ...allNotes[0],
        createdAt: allNotes[0].createdAt.toISOString(),
        updatedAt: allNotes[0].updatedAt.toISOString(),
      },
    ]);
  });

  test('should only return notes created by the user', async () => {
    const anotherUser = await createUser(app!, {
      name: 'Another User',
      email: 'another@example.com',
    });

    const { authCookie, user } = await createAndSignInUser(app!);

    await db.insert(schema.notes).values({
      content: 'Some content',
      createdBy: anotherUser.id,
    });

    // First creates a note for the user
    await supertest(app!)
      .post('/api/trpc/notes.createNote')
      .send({
        json: {
          content: 'Lorem Ipsum!',
        } satisfies CreateNotesSchemaType,
      })
      .set('Cookie', authCookie);

    const res = await supertest(app!)
      .get('/api/trpc/notes.findAll')
      .set('Cookie', authCookie);

    console.log(JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);

    const allNotesFromLoggedInUser = await db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.createdBy, user.id));

    expect(res.body.result.data.json.notes).to.deep.equal([
      {
        ...allNotesFromLoggedInUser[0],
        createdAt: allNotesFromLoggedInUser[0].createdAt.toISOString(),
        updatedAt: allNotesFromLoggedInUser[0].updatedAt.toISOString(),
      },
    ]);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!).get('/api/trpc/notes.findAll');

    expect(res.status).toBe(401);
  });
});
