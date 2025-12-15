import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import { describe, expect } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import {
  type CreateNoteTagSchemaType,
  type CreateTagSchemaType,
  type DeleteNoteTagSchemaType,
  type EditNoteTagSchemaType,
  type EditTagSchemaType,
  type FindAllNoteTagsSchemaType,
} from '@api/schemas/tags';
import { createNoteThroughApi } from '@api/tests/noteUtils';
import { createAndSignInUser, createUser } from '@api/tests/sessionUtils';
import {
  createNoteTagThroughApi,
  createTagThroughApi,
} from '@api/tests/tagUtils';
import { test } from '@api/tests/testExtend';

describe('tags.createTag', () => {
  test('should be correctly handled', async ({ app }) => {
    expect((await db.select().from(schema.tags)).length).toBe(0);
    const { authCookie, user } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .post('/api/trpc/tags.createTag')
      .send({
        json: {
          name: 'Some random tag',
          type: 'string',
        } satisfies CreateTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const createdTag = (await db.select().from(schema.tags).limit(1))[0];

    expect(createdTag.name).toBe('Some random tag');
    expect(createdTag.type).toBe('string');
    expect(createdTag.createdAt).not.toBeNull();
    expect(createdTag.updatedAt).not.toBeNull();
    expect(createdTag.createdBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(user.id);
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/tags.createTag')
      .send({
        json: {
          name: 'date tag',
          type: 'date',
        } satisfies CreateTagSchemaType,
      });

    expect(res.status).toBe(401);
    expect((await db.select().from(schema.tags)).length).toBe(0);
  });
});

describe('tags.editTag', () => {
  test('should be correctly handled', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);

    await createTagThroughApi({ app: app!, authCookie });
    const createdTag = (await db.select().from(schema.tags).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/tags.editTag')
      .send({
        json: {
          id: createdTag.id,
          name: 'new-tag-name',
        } satisfies EditTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const updatedTag = (await db.select().from(schema.tags).limit(1))[0];

    expect(updatedTag.name).toBe('new-tag-name');
    expect(updatedTag.createdAt).not.toBeNull();
    expect(updatedTag.updatedAt).not.toBeNull();

    // the tag type should remain the same
    expect(updatedTag.type).toBe(createdTag.type);

    // the created user should be the same
    expect(updatedTag.createdBy).toBe(user.id);
    expect(createdTag.createdBy).toBe(updatedTag.createdBy);

    // the updated user should be the same
    expect(updatedTag.updatedBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(updatedTag.updatedBy);

    // the created date should also remain the same
    expect(updatedTag.createdAt).not.toBeNull();
    expect(createdTag.createdAt).toEqual(updatedTag.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedTag.updatedAt.getTime()).toBeGreaterThan(
      createdTag.updatedAt.getTime(),
    );
  });

  test('should not allow edition for a tag created by a different user', async ({
    app,
  }) => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    await createTagThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const tagCreatedForAnotherUser = (
      await db.select().from(schema.tags).limit(1)
    )[0];

    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .post('/api/trpc/tags.editTag')
      .send({
        json: {
          id: tagCreatedForAnotherUser.id,
          name: 'tag-updated',
        } satisfies EditTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // tag should remain the same
    const updatedTag = (await db.select().from(schema.tags).limit(1))[0];
    expect(updatedTag.name).toBe(tagCreatedForAnotherUser.name);
    expect(updatedTag.createdAt).toEqual(tagCreatedForAnotherUser.createdAt);
    expect(updatedTag.updatedAt).toEqual(tagCreatedForAnotherUser.updatedAt);
    expect(updatedTag.createdBy).toBe(tagCreatedForAnotherUser.createdBy);
    expect(updatedTag.updatedBy).toBe(tagCreatedForAnotherUser.updatedBy);
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/tags.editTag')
      .send({ json: {} });

    expect(res.status).toBe(401);
  });
});

describe('tags.findAllTags', () => {
  test('should be correctly handled', async ({ app }) => {
    const { authCookie } = await createAndSignInUser(app!);

    // First creates a note for the user
    await createTagThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllTags')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allTags = await db.select().from(schema.tags);
    expect(res.body.result.data.json.tags).to.deep.equal([
      {
        ...allTags[0],
        createdAt: allTags[0].createdAt.toISOString(),
        updatedAt: allTags[0].updatedAt.toISOString(),
      },
    ]);
  });

  test('should only return tags created by the user', async ({ app }) => {
    const anotherUser = await createUser(app!, {
      name: 'Another User',
      email: 'another@example.com',
    });

    const { authCookie, user } = await createAndSignInUser(app!);

    await db.insert(schema.tags).values({
      name: 'Some content',
      type: 'string',
      createdBy: anotherUser.id,
      updatedBy: anotherUser.id,
    });

    // First creates a note for the user
    await createTagThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllTags')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allTagsFromLoggedInUser = await db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.createdBy, user.id));

    expect(res.body.result.data.json.tags).to.deep.equal([
      {
        ...allTagsFromLoggedInUser[0],
        createdAt: allTagsFromLoggedInUser[0].createdAt.toISOString(),
        updatedAt: allTagsFromLoggedInUser[0].updatedAt.toISOString(),
      },
    ]);
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!).get('/api/trpc/tags.findAllTags');

    expect(res.status).toBe(401);
  });
});

describe('tags.createNoteTag', () => {
  test('should correctly handle note tag [string]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);
    await createNoteThroughApi({ app: app!, authCookie });

    const createdNote = (await db.select().from(schema.notes).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: createdNote.id,
          type: 'string',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect((await db.select().from(schema.tags)).length).toBe(1);
    expect((await db.select().from(schema.noteTags)).length).toBe(1);

    const createdTag = (await db.select().from(schema.tags).limit(1))[0];
    const createdNoteTag = (
      await db.select().from(schema.noteTags).limit(1)
    )[0];

    // Assert tag fields
    expect(createdTag.name).toBe('my tag');
    expect(createdTag.type).toBe('string');
    expect(createdTag.createdAt).not.toBeNull();
    expect(createdTag.updatedAt).not.toBeNull();
    expect(createdTag.createdBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(user.id);

    // Assert note tag fields
    expect(createdNoteTag.tagId).toBe(createdTag.id);
    expect(createdNoteTag.noteId).toBe(createdNote.id);
    expect(createdNoteTag.valueBoolean).toBeNull();
    expect(createdNoteTag.valueDate).toBeNull();
    expect(createdNoteTag.valueNumber).toBeNull();
    expect(createdNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.updatedAt).not.toBeNull();
    expect(createdNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(user.id);
  });

  test('should correctly handle note tag [number]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);
    await createNoteThroughApi({ app: app!, authCookie });

    const createdNote = (await db.select().from(schema.notes).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: createdNote.id,
          value: 15.5,
          type: 'number',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect((await db.select().from(schema.tags)).length).toBe(1);
    expect((await db.select().from(schema.noteTags)).length).toBe(1);

    const createdTag = (await db.select().from(schema.tags).limit(1))[0];
    const createdNoteTag = (
      await db.select().from(schema.noteTags).limit(1)
    )[0];

    // Assert tag fields
    expect(createdTag.name).toBe('my tag');
    expect(createdTag.type).toBe('number');
    expect(createdTag.createdAt).not.toBeNull();
    expect(createdTag.updatedAt).not.toBeNull();
    expect(createdTag.createdBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(user.id);

    // Assert note tag fields
    expect(createdNoteTag.tagId).toBe(createdTag.id);
    expect(createdNoteTag.noteId).toBe(createdNote.id);
    expect(createdNoteTag.valueBoolean).toBeNull();
    expect(createdNoteTag.valueDate).toBeNull();
    expect(createdNoteTag.valueNumber).toBe(15.5);
    expect(createdNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.updatedAt).not.toBeNull();
    expect(createdNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(user.id);
  });

  test('should correctly handle note tag [date]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);
    await createNoteThroughApi({ app: app!, authCookie });

    const createdNote = (await db.select().from(schema.notes).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: createdNote.id,
          value: '2025-10-23',
          type: 'date',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect((await db.select().from(schema.tags)).length).toBe(1);
    expect((await db.select().from(schema.noteTags)).length).toBe(1);

    const createdTag = (await db.select().from(schema.tags).limit(1))[0];
    const createdNoteTag = (
      await db.select().from(schema.noteTags).limit(1)
    )[0];

    // Assert tag fields
    expect(createdTag.name).toBe('my tag');
    expect(createdTag.type).toBe('date');
    expect(createdTag.createdAt).not.toBeNull();
    expect(createdTag.updatedAt).not.toBeNull();
    expect(createdTag.createdBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(user.id);

    // Assert note tag fields
    expect(createdNoteTag.tagId).toBe(createdTag.id);
    expect(createdNoteTag.noteId).toBe(createdNote.id);
    expect(createdNoteTag.valueBoolean).toBeNull();
    expect(createdNoteTag.valueDate).toBe('2025-10-23');
    expect(createdNoteTag.valueNumber).toBeNull();
    expect(createdNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.updatedAt).not.toBeNull();
    expect(createdNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(user.id);
  });

  test('should correctly handle note tag [boolean]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);
    await createNoteThroughApi({ app: app!, authCookie });

    const createdNote = (await db.select().from(schema.notes).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: createdNote.id,
          value: true,
          type: 'boolean',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect((await db.select().from(schema.tags)).length).toBe(1);
    expect((await db.select().from(schema.noteTags)).length).toBe(1);

    const createdTag = (await db.select().from(schema.tags).limit(1))[0];
    const createdNoteTag = (
      await db.select().from(schema.noteTags).limit(1)
    )[0];

    // Assert tag fields
    expect(createdTag.name).toBe('my tag');
    expect(createdTag.type).toBe('boolean');
    expect(createdTag.createdAt).not.toBeNull();
    expect(createdTag.updatedAt).not.toBeNull();
    expect(createdTag.createdBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(user.id);

    // Assert note tag fields
    expect(createdNoteTag.tagId).toBe(createdTag.id);
    expect(createdNoteTag.noteId).toBe(createdNote.id);
    expect(createdNoteTag.valueBoolean).toBe(true);
    expect(createdNoteTag.valueDate).toBeNull();
    expect(createdNoteTag.valueNumber).toBeNull();
    expect(createdNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.updatedAt).not.toBeNull();
    expect(createdNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(user.id);
  });

  test('should not create a new tag if a tag of same name and type already exists', async ({
    app,
  }) => {
    const { authCookie, user } = await createAndSignInUser(app!);
    await createNoteThroughApi({ app: app!, authCookie });
    await createTagThroughApi({
      app: app!,
      authCookie,
      tag: { name: 'my tag', type: 'string' },
    });

    const createdNote = (await db.select().from(schema.notes).limit(1))[0];
    const createdTag = (await db.select().from(schema.tags).limit(1))[0];

    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: createdNote.id,
          type: 'string',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect((await db.select().from(schema.tags)).length).toBe(1);
    expect((await db.select().from(schema.noteTags)).length).toBe(1);

    const createdNoteTag = (
      await db.select().from(schema.noteTags).limit(1)
    )[0];

    // Assert tag fields
    expect(createdTag.name).toBe('my tag');
    expect(createdTag.type).toBe('string');
    expect(createdTag.createdAt).not.toBeNull();
    expect(createdTag.updatedAt).not.toBeNull();
    expect(createdTag.createdBy).toBe(user.id);
    expect(createdTag.updatedBy).toBe(user.id);

    // Assert note tag fields
    expect(createdNoteTag.tagId).toBe(createdTag.id);
    expect(createdNoteTag.noteId).toBe(createdNote.id);
    expect(createdNoteTag.valueBoolean).toBeNull();
    expect(createdNoteTag.valueDate).toBeNull();
    expect(createdNoteTag.valueNumber).toBeNull();
    expect(createdNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.updatedAt).not.toBeNull();
    expect(createdNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(user.id);
  });

  test('should return an error if user does not have access to passed note', async ({
    app,
  }) => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      { name: 'Another User', email: 'another@example.com' },
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
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: noteCreatedForAnotherUser.id,
          type: 'string',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);
    expect((await db.select().from(schema.tags)).length).toBe(0);
    expect((await db.select().from(schema.noteTags)).length).toBe(0);
    expect((await db.select().from(schema.notes)).length).toBe(1);
  });

  test('should create new tag even if the tag exists for another user', async ({
    app,
  }) => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      { name: 'Another User', email: 'another@example.com' },
    );

    await createTagThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
      tag: { name: 'my tag', type: 'string' },
    });

    const { authCookie } = await createAndSignInUser(app!);

    const note = await createNoteThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({
        json: {
          name: 'my tag',
          noteId: note.id,
          type: 'string',
        } satisfies CreateNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect((await db.select().from(schema.tags)).length).toBe(2);
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/tags.createNoteTag')
      .send({ json: {} });

    expect(res.status).toBe(401);
  });
});

describe('tags.deleteNoteTag', () => {
  test('should be correctly handled', async ({ app }) => {
    const { authCookie } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({ app: app!, authCookie });
    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .post('/api/trpc/tags.deleteNoteTag')
      .send({
        json: {
          noteId: createdNoteTag.noteId,
          tagId: createdNoteTag.tagId,
        } satisfies DeleteNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    // tag and note should still exist
    const [updatedTag] = await db.select().from(schema.tags).limit(1);
    const [updatedNote] = await db.select().from(schema.notes).limit(1);
    expect(updatedTag).toBeTruthy();
    expect(updatedNote).toBeTruthy();

    // note tag should no longer exist
    const [updatedNoteTag] = await db.select().from(schema.noteTags).limit(1);
    expect(updatedNoteTag).toBeFalsy();
  });

  test('should not allow deletion for a note tag created in a note by a different user', async ({
    app,
  }) => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    await createNoteTagThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const [noteTagCreatedForAnotherUser] = await db
      .select()
      .from(schema.noteTags)
      .limit(1);

    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .post('/api/trpc/tags.deleteNoteTag')
      .send({
        json: {
          noteId: noteTagCreatedForAnotherUser.noteId,
          tagId: noteTagCreatedForAnotherUser.tagId,
        } satisfies DeleteNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // note tag should still exist
    const [updatedNoteTag] = await db.select().from(schema.noteTags).limit(1);
    expect(updatedNoteTag).toBeTruthy();
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/tags.deleteNoteTag')
      .send({ json: {} });

    expect(res.status).toBe(401);
  });
});

describe('tags.editNoteTag', () => {
  test('should be correctly handled [string]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({ app: app!, authCookie });
    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);
    const [createdTag] = await db.select().from(schema.tags).limit(1);

    const res = await supertest(app!)
      .post('/api/trpc/tags.editNoteTag')
      .send({
        json: {
          noteId: createdNoteTag.noteId,
          tagId: createdNoteTag.tagId,
          value: 'new-string-tag-value',
        } satisfies EditNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedTag] = await db.select().from(schema.tags).limit(1);
    const [updatedNoteTag] = await db.select().from(schema.noteTags).limit(1);

    // Assert tag fields
    expect(updatedTag.name).toBe('new-string-tag-value');
    expect(updatedTag.type).toBe('string');

    // Assert note tag fields
    expect(updatedNoteTag.tagId).toBe(createdNoteTag.tagId);
    expect(updatedNoteTag.noteId).toBe(createdNoteTag.noteId);
    expect(updatedNoteTag.valueBoolean).toBeNull();
    expect(updatedNoteTag.valueDate).toBeNull();
    expect(updatedNoteTag.valueNumber).toBeNull();

    // the created user should be the same
    expect(updatedNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.createdBy).toBe(updatedNoteTag.createdBy);

    // the updated user should be the same
    expect(updatedNoteTag.updatedBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(updatedNoteTag.updatedBy);

    // the created date should also remain the same
    expect(updatedNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.createdAt).toEqual(updatedNoteTag.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedTag.updatedAt.getTime()).toBeGreaterThan(
      createdTag.updatedAt.getTime(),
    );

    // the updated date should remain the same at note tag level, as only the tag was updated
    expect(updatedNoteTag.updatedAt.getTime()).toBe(
      createdNoteTag.updatedAt.getTime(),
    );
  });

  test('should be correctly handled [number]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({
      app: app!,
      authCookie,
      noteTag: {
        name: 'number-tag',
        noteId: '',
        type: 'number',
        value: 5,
      },
    });
    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .post('/api/trpc/tags.editNoteTag')
      .send({
        json: {
          noteId: createdNoteTag.noteId,
          tagId: createdNoteTag.tagId,
          value: 13.5,
        } satisfies EditNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedTag] = await db.select().from(schema.tags).limit(1);
    const [updatedNoteTag] = await db.select().from(schema.noteTags).limit(1);

    // Assert tag fields
    expect(updatedTag.name).toBe('number-tag');
    expect(updatedTag.type).toBe('number');

    // Assert note tag fields
    expect(updatedNoteTag.tagId).toBe(createdNoteTag.tagId);
    expect(updatedNoteTag.noteId).toBe(createdNoteTag.noteId);
    expect(updatedNoteTag.valueBoolean).toBeNull();
    expect(updatedNoteTag.valueDate).toBeNull();
    expect(updatedNoteTag.valueNumber).toBe(13.5);

    // the created user should be the same
    expect(updatedNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.createdBy).toBe(updatedNoteTag.createdBy);

    // the updated user should be the same
    expect(updatedNoteTag.updatedBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(updatedNoteTag.updatedBy);

    // the created date should also remain the same
    expect(updatedNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.createdAt).toEqual(updatedNoteTag.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedNoteTag.updatedAt.getTime()).toBeGreaterThan(
      createdNoteTag.updatedAt.getTime(),
    );
  });

  test('should be correctly handled [date]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({
      app: app!,
      authCookie,
      noteTag: {
        name: 'date-tag',
        noteId: '',
        type: 'date',
        value: '2025-10-25',
      },
    });
    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .post('/api/trpc/tags.editNoteTag')
      .send({
        json: {
          noteId: createdNoteTag.noteId,
          tagId: createdNoteTag.tagId,
          value: '2025-10-26',
        } satisfies EditNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedTag] = await db.select().from(schema.tags).limit(1);
    const [updatedNoteTag] = await db.select().from(schema.noteTags).limit(1);

    // Assert tag fields
    expect(updatedTag.name).toBe('date-tag');
    expect(updatedTag.type).toBe('date');

    // Assert note tag fields
    expect(updatedNoteTag.tagId).toBe(createdNoteTag.tagId);
    expect(updatedNoteTag.noteId).toBe(createdNoteTag.noteId);
    expect(updatedNoteTag.valueBoolean).toBeNull();
    expect(updatedNoteTag.valueDate).toBe('2025-10-26');
    expect(updatedNoteTag.valueNumber).toBeNull;

    // the created user should be the same
    expect(updatedNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.createdBy).toBe(updatedNoteTag.createdBy);

    // the updated user should be the same
    expect(updatedNoteTag.updatedBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(updatedNoteTag.updatedBy);

    // the created date should also remain the same
    expect(updatedNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.createdAt).toEqual(updatedNoteTag.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedNoteTag.updatedAt.getTime()).toBeGreaterThan(
      createdNoteTag.updatedAt.getTime(),
    );
  });

  test('should be correctly handled [boolean]', async ({ app }) => {
    const { authCookie, user } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({
      app: app!,
      authCookie,
      noteTag: {
        name: 'boolean-tag',
        noteId: '',
        type: 'boolean',
        value: true,
      },
    });
    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .post('/api/trpc/tags.editNoteTag')
      .send({
        json: {
          noteId: createdNoteTag.noteId,
          tagId: createdNoteTag.tagId,
          value: false,
        } satisfies EditNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedTag] = await db.select().from(schema.tags).limit(1);
    const [updatedNoteTag] = await db.select().from(schema.noteTags).limit(1);

    // Assert tag fields
    expect(updatedTag.name).toBe('boolean-tag');
    expect(updatedTag.type).toBe('boolean');

    // Assert note tag fields
    expect(updatedNoteTag.tagId).toBe(createdNoteTag.tagId);
    expect(updatedNoteTag.noteId).toBe(createdNoteTag.noteId);
    expect(updatedNoteTag.valueBoolean).toBe(false);
    expect(updatedNoteTag.valueDate).toBeNull();
    expect(updatedNoteTag.valueNumber).toBeNull;

    // the created user should be the same
    expect(updatedNoteTag.createdBy).toBe(user.id);
    expect(createdNoteTag.createdBy).toBe(updatedNoteTag.createdBy);

    // the updated user should be the same
    expect(updatedNoteTag.updatedBy).toBe(user.id);
    expect(createdNoteTag.updatedBy).toBe(updatedNoteTag.updatedBy);

    // the created date should also remain the same
    expect(updatedNoteTag.createdAt).not.toBeNull();
    expect(createdNoteTag.createdAt).toEqual(updatedNoteTag.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedNoteTag.updatedAt.getTime()).toBeGreaterThan(
      createdNoteTag.updatedAt.getTime(),
    );
  });

  test('should not allow edition for a note tag created by a different user', async ({
    app,
  }) => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    await createNoteTagThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const [noteTagCreatedForAnotherUser] = await db
      .select()
      .from(schema.noteTags)
      .limit(1);
    const [noteCreatedForAnotherUser] = await db
      .select()
      .from(schema.notes)
      .limit(1);
    const [tagCreatedForAnotherUser] = await db
      .select()
      .from(schema.tags)
      .limit(1);

    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .post('/api/trpc/tags.editNoteTag')
      .send({
        json: {
          noteId: noteCreatedForAnotherUser.id,
          tagId: tagCreatedForAnotherUser.id,
          value: 'tag-updated',
        } satisfies EditNoteTagSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // noteTag should remain the same
    const updatedNoteTag = (
      await db.select().from(schema.noteTags).limit(1)
    )[0];
    expect(updatedNoteTag.valueBoolean).toBe(
      noteTagCreatedForAnotherUser.valueBoolean,
    );
    expect(updatedNoteTag.valueDate).toBe(
      noteTagCreatedForAnotherUser.valueDate,
    );
    expect(updatedNoteTag.valueNumber).toBe(
      noteTagCreatedForAnotherUser.valueNumber,
    );
    expect(updatedNoteTag.createdAt).toEqual(
      noteTagCreatedForAnotherUser.createdAt,
    );
    expect(updatedNoteTag.updatedAt).toEqual(
      noteTagCreatedForAnotherUser.updatedAt,
    );
    expect(updatedNoteTag.createdBy).toBe(
      noteTagCreatedForAnotherUser.createdBy,
    );
    expect(updatedNoteTag.updatedBy).toBe(
      noteTagCreatedForAnotherUser.updatedBy,
    );
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!)
      .post('/api/trpc/tags.editNoteTag')
      .send({ json: {} });

    expect(res.status).toBe(401);
  });
});

describe('tags.findAllNoteTags', () => {
  test('should be correctly handled [string]', async ({ app }) => {
    const { authCookie } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({ app: app!, authCookie });
    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllNoteTags')
      .query({
        input: JSON.stringify({
          json: {
            noteId: createdNoteTag.noteId,
          } satisfies FindAllNoteTagsSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allTags = await db.select().from(schema.tags);
    const allNotesTags = await db.select().from(schema.noteTags);
    expect(res.body.result.data.json.noteTags).to.deep.equal([
      {
        createdAt: allNotesTags[0].createdAt.toISOString(),
        name: allTags[0].name,
        noteId: allNotesTags[0].noteId,
        tagId: allNotesTags[0].tagId,
        type: allTags[0].type,
        updatedAt: allTags[0].updatedAt.toISOString(),
        value: allTags[0].name,
      },
    ]);
  });

  test('should be correctly handled [number]', async ({ app }) => {
    const { authCookie } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({
      app: app!,
      authCookie,
      noteTag: {
        name: 'number-tag',
        noteId: '',
        type: 'number',
        value: 13,
      },
    });

    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllNoteTags')
      .query({
        input: JSON.stringify({
          json: {
            noteId: createdNoteTag.noteId,
          } satisfies FindAllNoteTagsSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allTags = await db.select().from(schema.tags);
    const allNotesTags = await db.select().from(schema.noteTags);
    expect(res.body.result.data.json.noteTags).to.deep.equal([
      {
        createdAt: allNotesTags[0].createdAt.toISOString(),
        name: allTags[0].name,
        noteId: allNotesTags[0].noteId,
        tagId: allNotesTags[0].tagId,
        type: allTags[0].type,
        updatedAt: allNotesTags[0].updatedAt.toISOString(),
        value: allNotesTags[0].valueNumber,
      },
    ]);
  });

  test('should be correctly handled [date]', async ({ app }) => {
    const { authCookie } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({
      app: app!,
      authCookie,
      noteTag: {
        name: 'date-tag',
        noteId: '',
        type: 'date',
        value: '2025-10-26',
      },
    });

    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllNoteTags')
      .query({
        input: JSON.stringify({
          json: {
            noteId: createdNoteTag.noteId,
          } satisfies FindAllNoteTagsSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allTags = await db.select().from(schema.tags);
    const allNotesTags = await db.select().from(schema.noteTags);
    expect(res.body.result.data.json.noteTags).to.deep.equal([
      {
        createdAt: allNotesTags[0].createdAt.toISOString(),
        name: allTags[0].name,
        noteId: allNotesTags[0].noteId,
        tagId: allNotesTags[0].tagId,
        type: allTags[0].type,
        updatedAt: allNotesTags[0].updatedAt.toISOString(),
        value: allNotesTags[0].valueDate,
      },
    ]);
  });

  test('should be correctly handled [boolean]', async ({ app }) => {
    const { authCookie } = await createAndSignInUser(app!);

    await createNoteTagThroughApi({
      app: app!,
      authCookie,
      noteTag: {
        name: 'boolean-tag',
        noteId: '',
        type: 'boolean',
        value: true,
      },
    });

    const [createdNoteTag] = await db.select().from(schema.noteTags).limit(1);

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllNoteTags')
      .query({
        input: JSON.stringify({
          json: {
            noteId: createdNoteTag.noteId,
          } satisfies FindAllNoteTagsSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allTags = await db.select().from(schema.tags);
    const allNotesTags = await db.select().from(schema.noteTags);
    expect(res.body.result.data.json.noteTags).to.deep.equal([
      {
        createdAt: allNotesTags[0].createdAt.toISOString(),
        name: allTags[0].name,
        noteId: allNotesTags[0].noteId,
        tagId: allNotesTags[0].tagId,
        type: allTags[0].type,
        updatedAt: allNotesTags[0].updatedAt.toISOString(),
        value: allNotesTags[0].valueBoolean,
      },
    ]);
  });

  test('should only return note tags for notes created by the user', async ({
    app,
  }) => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    await createNoteTagThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const [noteCreatedForAnotherUser] = await db
      .select()
      .from(schema.notes)
      .limit(1);

    // Logins with another user
    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllNoteTags')
      .query({
        input: JSON.stringify({
          json: {
            noteId: noteCreatedForAnotherUser.id,
          } satisfies FindAllNoteTagsSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);
  });

  test('should be a protected route', async ({ app }) => {
    const res = await supertest(app!).get('/api/trpc/tags.findAllNoteTags');

    expect(res.status).toBe(401);
  });
});
