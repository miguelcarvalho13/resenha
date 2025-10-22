import { eq } from 'drizzle-orm';
import { reset } from 'drizzle-seed';
import { type Server } from 'http';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import {
  type CreateTagSchemaType,
  type EditTagSchemaType,
} from '@api/schemas/tags';
import { startApp } from '@api/server';
import { createAndSignInUser, createUser } from '@api/tests/sessionUtils';
import { createTagThroughApi } from '@api/tests/tagUtils';

let app: Server | null = null;

beforeEach(() => {
  app = startApp({ port: 3001 });
});

afterEach(async () => {
  app?.close();
  await reset(db, schema);
});

describe('tags.createTag', () => {
  test('should be correctly handled', async () => {
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

  test('should be a protected route', async () => {
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
  test('should be correctly handled', async () => {
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

  test('should not allow edition for a tag created for a different user', async () => {
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

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/tags.editTag')
      .send({ json: {} });

    expect(res.status).toBe(401);
  });
});

describe('tags.findAllTags', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    // First creates a note for the user
    await createTagThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/tags.findAllTags')
      .set('Cookie', authCookie);

    console.log(JSON.stringify(res.body, null, 2));

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

  test('should only return tags created by the user', async () => {
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

  test('should be a protected route', async () => {
    const res = await supertest(app!).get('/api/trpc/tags.findAllTags');

    expect(res.status).toBe(401);
  });
});
