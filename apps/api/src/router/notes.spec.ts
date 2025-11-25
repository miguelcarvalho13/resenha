import { eq } from 'drizzle-orm';
import { reset } from 'drizzle-seed';
import { type Server } from 'http';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import {
  type CreateNoteSchemaType,
  type EditNoteSchemaType,
  type HardDeleteNotesSchemaType,
  type SoftDeleteNotesSchemaType,
} from '@api/schemas/notes';
import { startApp } from '@api/server';
import { createNoteThroughApi } from '@api/tests/noteUtils';
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
        } satisfies CreateNoteSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const createdNote = (await db.select().from(schema.notes).limit(1))[0];

    expect(createdNote.content).toBe('Lorem Ipsum!');
    expect(createdNote.createdAt).not.toBeNull();
    expect(createdNote.updatedAt).not.toBeNull();
    expect(createdNote.createdBy).toBe(user.id);
  });

  test('should be a protected route', async () => {
    expect((await db.select().from(schema.notes)).length).toBe(0);

    const res = await supertest(app!)
      .post('/api/trpc/notes.createNote')
      .send({
        json: {
          content: 'Lorem Ipsum!',
        } satisfies CreateNoteSchemaType,
      });

    expect(res.status).toBe(401);

    expect((await db.select().from(schema.notes)).length).toBe(0);
  });
});

describe('notes.hardDeleteNotes', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    const createdNote = await createNoteThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .post('/api/trpc/notes.hardDeleteNotes')
      .send({
        json: {
          noteIds: [createdNote.id],
        } satisfies HardDeleteNotesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(await db.select().from(schema.notes)).toHaveLength(0);
  });

  test('should not allow hard deletion for a note created by a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    const noteCreatedByAnotherUser = await createNoteThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const { authCookie } = await createAndSignInUser(app!);

    const noteCreatedByCurrentUser = await createNoteThroughApi({
      app: app!,
      authCookie,
    });

    const res = await supertest(app!)
      .post('/api/trpc/notes.hardDeleteNotes')
      .send({
        json: {
          noteIds: [noteCreatedByCurrentUser.id, noteCreatedByAnotherUser.id],
        } satisfies HardDeleteNotesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // notes should have been deleted
    expect(await db.select().from(schema.notes)).toHaveLength(2);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/notes.hardDeleteNotes')
      .send();

    expect(res.status).toBe(401);
  });
});

describe('notes.softDeleteNotes', () => {
  test('should be correctly handled', async () => {
    const { authCookie, user } = await createAndSignInUser(app!);

    const createdNote = await createNoteThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .post('/api/trpc/notes.softDeleteNotes')
      .send({
        json: {
          noteIds: [createdNote.id],
        } satisfies SoftDeleteNotesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const updatedNote = (await db.select().from(schema.notes).limit(1))[0];

    expect(updatedNote.content).toBe(createdNote.content);
    expect(updatedNote.createdAt).not.toBeNull();
    expect(updatedNote.updatedAt).not.toBeNull();
    expect(updatedNote.deletedAt).not.toBeNull();

    // the created user should be the same
    expect(updatedNote.createdBy).toBe(user.id);
    expect(createdNote.createdBy).toBe(updatedNote.createdBy);

    // the created date should also remain the same
    expect(updatedNote.createdAt).not.toBeNull();
    expect(createdNote.createdAt).toEqual(updatedNote.createdAt);

    // the deleted user should be present
    expect(updatedNote.deletedBy).not.toBeNull();
    expect(updatedNote.deletedBy).toBe(user.id);

    // the updated date should be more recent than the created date
    expect(updatedNote.updatedAt.getTime()).toBeGreaterThan(
      createdNote.updatedAt.getTime(),
    );

    // the deleted date should be more recent than the created date
    expect(updatedNote.deletedAt?.getTime()).toBeGreaterThan(
      createdNote.updatedAt.getTime(),
    );
  });

  test('should not allow soft deletion for a note created by a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    const noteCreatedByAnotherUser = await createNoteThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const { authCookie } = await createAndSignInUser(app!);

    const noteCreatedByCurrentUser = await createNoteThroughApi({
      app: app!,
      authCookie,
    });

    const res = await supertest(app!)
      .post('/api/trpc/notes.softDeleteNotes')
      .send({
        json: {
          noteIds: [noteCreatedByCurrentUser.id, noteCreatedByAnotherUser.id],
        } satisfies SoftDeleteNotesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // note should remain the same
    const updatedNotes = await db.select().from(schema.notes).limit(2);

    expect(updatedNotes).to.deep.equal([
      noteCreatedByAnotherUser,
      noteCreatedByCurrentUser,
    ]);

    expect(updatedNotes[0].deletedAt).toBeNull();
    expect(updatedNotes[0].deletedBy).toBeNull();
    expect(updatedNotes[1].deletedAt).toBeNull();
    expect(updatedNotes[1].deletedBy).toBeNull();
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/notes.softDeleteNotes')
      .send();

    expect(res.status).toBe(401);
  });
});

describe('notes.editNote', () => {
  test('should be correctly handled', async () => {
    const { authCookie, user } = await createAndSignInUser(app!);

    await createNoteThroughApi({ app: app!, authCookie });
    const createdNote = (await db.select().from(schema.notes).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/notes.editNote')
      .send({
        json: {
          id: createdNote.id,
          content: 'Lorem Ipsum! updated!',
        } satisfies EditNoteSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const updatedNote = (await db.select().from(schema.notes).limit(1))[0];

    expect(updatedNote.content).toBe('Lorem Ipsum! updated!');
    expect(updatedNote.createdAt).not.toBeNull();
    expect(updatedNote.updatedAt).not.toBeNull();

    // the created user should be the same
    expect(updatedNote.createdBy).toBe(user.id);
    expect(createdNote.createdBy).toBe(updatedNote.createdBy);

    // the created date should also remain the same
    expect(updatedNote.createdAt).not.toBeNull();
    expect(createdNote.createdAt).toEqual(updatedNote.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedNote.updatedAt.getTime()).toBeGreaterThan(
      createdNote.updatedAt.getTime(),
    );
  });

  test('should not allow edition for a note created for a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    await createNoteThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const noteCreatedForAnotherUser = (
      await db.select().from(schema.notes).limit(1)
    )[0];

    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .post('/api/trpc/notes.editNote')
      .send({
        json: {
          id: noteCreatedForAnotherUser.id,
          content: 'Lorem Ipsum! updated!',
        } satisfies EditNoteSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // note should remain the same
    const updatedNote = (await db.select().from(schema.notes).limit(1))[0];
    expect(updatedNote.content).toBe(noteCreatedForAnotherUser.content);
    expect(updatedNote.createdAt).toEqual(noteCreatedForAnotherUser.createdAt);
    expect(updatedNote.updatedAt).toEqual(noteCreatedForAnotherUser.updatedAt);
    expect(updatedNote.createdBy).toBe(noteCreatedForAnotherUser.createdBy);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/notes.editNote')
      .send({
        json: {
          content: 'Lorem Ipsum!',
        } satisfies CreateNoteSchemaType,
      });

    expect(res.status).toBe(401);
  });
});

describe('notes.findAll', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    // First creates a note for the user
    await createNoteThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/notes.findAll')
      .set('Cookie', authCookie);

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
      updatedBy: anotherUser.id,
    });

    // First creates a note for the user
    await createNoteThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/notes.findAll')
      .set('Cookie', authCookie);

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
