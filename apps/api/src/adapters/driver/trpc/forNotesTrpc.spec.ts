import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import { describe, expect } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import {
  type CreateNoteSchemaType,
  type EditNoteSchemaType,
  type HardDeleteNotesSchemaType,
  type SoftDeleteNotesSchemaType,
  type UndoSoftDeletedNotesSchemaType,
} from '@api/adapters/driver/trpc/forNotesTrpcInputs';
import {
  createNoteThroughApi,
  softDeleteNotesThroughApi,
} from '@api/tests/noteUtils';
import { createAndSignInUser, createUser } from '@api/tests/sessionUtils';
import { test } from '@api/tests/testExtend';

describe('notes.createNote', () => {
  test('should be correctly handled', async ({ app }) => {
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

  test('should be a protected route', async ({ app }) => {
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
  test('should be correctly handled', async ({ app }) => {
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

  test('should not allow hard deletion for a note created by a different user', async ({
    app,
  }) => {
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

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/notes.hardDeleteNotes')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('notes.softDeleteNotes', () => {
  test('should be correctly handled', async ({ app }) => {
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

  test('should not allow soft deletion for a note created by a different user', async ({
    app,
  }) => {
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

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/notes.softDeleteNotes')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('notes.undoDeleteNotes', () => {
  test('should be correctly handled', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);

    const createdNote = await createNoteThroughApi({ app: app!, authCookie });

    // soft deletes note
    await softDeleteNotesThroughApi({
      app: app!,
      authCookie,
      noteIds: [createdNote.id],
    });

    const res = await supertest(app!)
      .post('/api/trpc/notes.undoSoftDeletedNotes')
      .send({
        json: {
          noteIds: [createdNote.id],
        } satisfies UndoSoftDeletedNotesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedNote] = await db.select().from(schema.notes).limit(1);

    expect(updatedNote.content).toBe(createdNote.content);
    expect(updatedNote.createdAt).not.toBeNull();
    expect(updatedNote.updatedAt).not.toBeNull();
    expect(updatedNote.deletedAt).toBeNull();

    // the created user should be the same
    expect(updatedNote.createdBy).toBe(user.id);
    expect(createdNote.createdBy).toBe(updatedNote.createdBy);

    // the created date should also remain the same
    expect(updatedNote.createdAt).not.toBeNull();
    expect(createdNote.createdAt).toEqual(updatedNote.createdAt);

    // the deleted user should be present
    expect(updatedNote.deletedBy).toBeNull();

    // the updated date should be more recent than the created date
    expect(updatedNote.updatedAt.getTime()).toBeGreaterThan(
      createdNote.updatedAt.getTime(),
    );
  });

  test('should not allow undo soft deletion for a note created by a different user', async ({
    app,
  }) => {
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

    await softDeleteNotesThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
      noteIds: [noteCreatedByAnotherUser.id],
    });

    const { authCookie } = await createAndSignInUser(app!);

    const noteCreatedByCurrentUser = await createNoteThroughApi({
      app: app!,
      authCookie,
    });

    await softDeleteNotesThroughApi({
      app: app!,
      authCookie,
      noteIds: [noteCreatedByCurrentUser.id],
    });

    const res = await supertest(app!)
      .post('/api/trpc/notes.undoSoftDeletedNotes')
      .send({
        json: {
          noteIds: [noteCreatedByCurrentUser.id, noteCreatedByAnotherUser.id],
        } satisfies UndoSoftDeletedNotesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // note should remain the same
    const updatedNotes = await db.select().from(schema.notes).limit(2);

    expect(updatedNotes).to.deep.equal([
      {
        ...noteCreatedByAnotherUser,
        deletedAt: updatedNotes[0].deletedAt,
        deletedBy: updatedNotes[0].deletedBy,
        updatedAt: updatedNotes[0].updatedAt,
      },
      {
        ...noteCreatedByCurrentUser,
        deletedAt: updatedNotes[1].deletedAt,
        deletedBy: updatedNotes[1].deletedBy,
        updatedAt: updatedNotes[1].updatedAt,
      },
    ]);

    expect(updatedNotes[0].deletedAt).not.toBeNull();
    expect(updatedNotes[0].deletedBy).not.toBeNull();
    expect(updatedNotes[1].deletedAt).not.toBeNull();
    expect(updatedNotes[1].deletedBy).not.toBeNull();
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/notes.undoSoftDeletedNotes')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('notes.editNote', () => {
  test('should be correctly handled', async ({ app }) => {
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

  test('should not allow edition for a note created for a different user', async ({
    app,
  }) => {
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

  test('should be a protected route', async ({ app }) => {
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
  test('should be correctly handled', async ({ app }) => {
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

  test('should only return notes created by the user', async ({ app }) => {
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

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!).get('/api/trpc/notes.findAll');

    expect(res.status).toBe(401);
  });
});
