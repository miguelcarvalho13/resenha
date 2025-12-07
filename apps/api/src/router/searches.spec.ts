import { eq } from 'drizzle-orm';
import { reset } from 'drizzle-seed';
import { type Server } from 'http';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import {
  type BooleanOperatorsType,
  type CreateSearchSchemaType,
  type DateOperatorsType,
  type EditSearchSchemaType,
  type FindSearchByIdSchemaType,
  type HardDeleteSearchesSchemaType,
  type NumberOperatorsType,
  type SearchNotesSchemaType,
  type SoftDeleteSearchesSchemaType,
  type UndoSoftDeletedSearchesSchemaType,
} from '@api/schemas/searches';
import { startApp } from '@api/server';
import {
  createNoteThroughApi,
  softDeleteNotesThroughApi,
} from '@api/tests/noteUtils';
import {
  createSearchThroughApi,
  softDeleteSearchesThroughApi,
} from '@api/tests/searchUtils';
import { createAndSignInUser, createUser } from '@api/tests/sessionUtils';
import { createNoteTagThroughApi } from '@api/tests/tagUtils';

let app: Server | null = null;

beforeEach(() => {
  app = startApp({ port: 3001 });
});

afterEach(async () => {
  app?.close();
  await reset(db, schema);
});

describe('searches.createSearch', () => {
  test('should be correctly handled', async () => {
    const { authCookie, user } = await createAndSignInUser(app!);
    const search = {
      content: {
        query: [
          { field: 'deleted', operator: { type: '>', value: '2000-01-01' } },
        ],
      },
    } satisfies CreateSearchSchemaType;

    const res = await supertest(app!)
      .post('/api/trpc/searches.createSearch')
      .send({ json: search })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [createdSearch] = await db.select().from(schema.searches).limit(1);

    expect(createdSearch.content).to.deep.equal(search.content);
    expect(createdSearch.createdAt).not.toBeNull();
    expect(createdSearch.updatedAt).not.toBeNull();
    expect(createdSearch.favorited).toBeFalsy();
    expect(createdSearch.name).toBeNull();
    expect(createdSearch.deletedAt).toBeNull();
    expect(createdSearch.deletedBy).toBeNull();
    expect(createdSearch.createdBy).toBe(user.id);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/searches.createSearch')
      .send({
        json: {
          content: { query: [] },
        } satisfies CreateSearchSchemaType,
      });

    expect(res.status).toBe(401);
    expect((await db.select().from(schema.searches)).length).toBe(0);
  });
});

describe('searches.findAllSearches', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    await createSearchThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/searches.findAllSearches')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allSearches = await db.select().from(schema.searches);
    expect(res.body.result.data.json.searches).to.deep.equal([
      {
        ...allSearches[0],
        createdAt: allSearches[0].createdAt.toISOString(),
        updatedAt: allSearches[0].updatedAt.toISOString(),
      },
    ]);
  });

  test('should not return soft deleted searches', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    const firstSearch = await createSearchThroughApi({ app: app!, authCookie });
    const secondSearch = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    await softDeleteSearchesThroughApi({
      app: app!,
      authCookie,
      searchIds: [firstSearch.id],
    });

    const res = await supertest(app!)
      .get('/api/trpc/searches.findAllSearches')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    expect(res.body.result.data.json.searches).to.deep.equal([
      {
        ...secondSearch,
        createdAt: secondSearch.createdAt.toISOString(),
        updatedAt: secondSearch.updatedAt.toISOString(),
      },
    ]);
  });

  test('should only return searches created by the user', async () => {
    const anotherUser = await createUser(app!, {
      name: 'Another User',
      email: 'another@example.com',
    });

    await db.insert(schema.searches).values({
      content: { query: [] },
      createdBy: anotherUser.id,
      updatedBy: anotherUser.id,
    });

    const { authCookie, user } = await createAndSignInUser(app!);

    // First creates a search for the current user
    await createSearchThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/searches.findAllSearches')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const allSearchesFromLoggedInUser = await db
      .select()
      .from(schema.searches)
      .where(eq(schema.searches.createdBy, user.id));

    expect(res.body.result.data.json.searches).to.deep.equal([
      {
        ...allSearchesFromLoggedInUser[0],
        createdAt: allSearchesFromLoggedInUser[0].createdAt.toISOString(),
        updatedAt: allSearchesFromLoggedInUser[0].updatedAt.toISOString(),
      },
    ]);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!).get('/api/trpc/searches.findAllSearches');

    expect(res.status).toBe(401);
  });
});

describe('searches.findSearchById', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    const search = await createSearchThroughApi({ app: app!, authCookie });

    const res = await supertest(app!)
      .get('/api/trpc/searches.findSearchById')
      .query({
        input: JSON.stringify({
          json: {
            searchId: search.id,
          } satisfies FindSearchByIdSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    expect(res.body.result.data.json.search).to.deep.equal({
      ...search,
      createdAt: search.createdAt.toISOString(),
      updatedAt: search.updatedAt.toISOString(),
    });
  });

  test('should only return searches created by the user', async () => {
    const anotherUser = await createUser(app!, {
      name: 'Another User',
      email: 'another@example.com',
    });

    const [searchCreatedByAnotherUser] = await db
      .insert(schema.searches)
      .values({
        content: { query: [] },
        createdBy: anotherUser.id,
        updatedBy: anotherUser.id,
      })
      .returning();

    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .get('/api/trpc/searches.findSearchById')
      .query({
        input: JSON.stringify({
          json: {
            searchId: searchCreatedByAnotherUser.id,
          } satisfies FindSearchByIdSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(404);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!).get('/api/trpc/searches.findSearchById');

    expect(res.status).toBe(401);
  });
});

describe('searches.hardDeleteSearches', () => {
  test('should be correctly handled', async () => {
    const { authCookie } = await createAndSignInUser(app!);

    const createdSearch = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    const res = await supertest(app!)
      .post('/api/trpc/searches.hardDeleteSearches')
      .send({
        json: {
          searchIds: [createdSearch.id],
        } satisfies HardDeleteSearchesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(await db.select().from(schema.searches)).toHaveLength(0);
  });

  test('should not allow hard deletion for a search created by a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    const searchCreatedByAnotherUser = await createSearchThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const { authCookie } = await createAndSignInUser(app!);

    const searchCreatedByCurrentUser = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    const res = await supertest(app!)
      .post('/api/trpc/searches.hardDeleteSearches')
      .send({
        json: {
          searchIds: [
            searchCreatedByCurrentUser.id,
            searchCreatedByAnotherUser.id,
          ],
        } satisfies HardDeleteSearchesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // searches should not have been deleted
    expect(await db.select().from(schema.searches)).toHaveLength(2);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/searches.hardDeleteSearches')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('searches.softDeleteSearches', () => {
  test('should be correctly handled', async () => {
    const { authCookie, user } = await createAndSignInUser(app!);

    const createdSearch = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    const res = await supertest(app!)
      .post('/api/trpc/searches.softDeleteSearches')
      .send({
        json: {
          searchIds: [createdSearch.id],
        } satisfies SoftDeleteSearchesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedSearch] = await db.select().from(schema.searches).limit(1);

    expect(updatedSearch.content).to.deep.equal(createdSearch.content);
    expect(updatedSearch.createdAt).not.toBeNull();
    expect(updatedSearch.updatedAt).not.toBeNull();
    expect(updatedSearch.deletedAt).not.toBeNull();

    // the created user should be the same
    expect(updatedSearch.createdBy).toBe(user.id);
    expect(createdSearch.createdBy).toBe(updatedSearch.createdBy);

    // the created date should also remain the same
    expect(updatedSearch.createdAt).not.toBeNull();
    expect(createdSearch.createdAt).toEqual(updatedSearch.createdAt);

    // the deleted user should be present
    expect(updatedSearch.deletedBy).not.toBeNull();
    expect(updatedSearch.deletedBy).toBe(user.id);

    // the updated date should be more recent than the created date
    expect(updatedSearch.updatedAt.getTime()).toBeGreaterThan(
      createdSearch.updatedAt.getTime(),
    );

    // the deleted date should be more recent than the created date
    expect(updatedSearch.deletedAt?.getTime()).toBeGreaterThan(
      createdSearch.updatedAt.getTime(),
    );
  });

  test('should not allow soft deletion for a search created by a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    const searchCreatedByAnotherUser = await createSearchThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const { authCookie } = await createAndSignInUser(app!);

    const searchCreatedByCurrentUser = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    const res = await supertest(app!)
      .post('/api/trpc/searches.softDeleteSearches')
      .send({
        json: {
          searchIds: [
            searchCreatedByCurrentUser.id,
            searchCreatedByAnotherUser.id,
          ],
        } satisfies SoftDeleteSearchesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // searches should remain the same
    const updatedSearches = await db.select().from(schema.searches).limit(2);

    expect(updatedSearches).to.deep.equal([
      searchCreatedByAnotherUser,
      searchCreatedByCurrentUser,
    ]);

    expect(updatedSearches[0].deletedAt).toBeNull();
    expect(updatedSearches[0].deletedBy).toBeNull();
    expect(updatedSearches[1].deletedAt).toBeNull();
    expect(updatedSearches[1].deletedBy).toBeNull();
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/searches.softDeleteSearches')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('searches.editSearch', () => {
  test('should be correctly handled', async () => {
    const { authCookie, user } = await createAndSignInUser(app!);

    const createdSearch = await createSearchThroughApi({
      app: app!,
      authCookie,
    });
    const content = {
      query: [
        { field: 'deleted', operator: { type: '>', value: '2000-01-01' } },
      ],
    } satisfies EditSearchSchemaType['content'];

    const res = await supertest(app!)
      .post('/api/trpc/searches.editSearch')
      .send({
        json: {
          content,
          favorited: true,
          id: createdSearch.id,
          name: 'my search',
        } satisfies EditSearchSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedSearch] = await db.select().from(schema.searches).limit(1);

    expect(updatedSearch.content).to.deep.equal(content);
    expect(updatedSearch.name).to.deep.equal('my search');
    expect(updatedSearch.favorited).toBeTruthy();
    expect(updatedSearch.createdAt).not.toBeNull();
    expect(updatedSearch.updatedAt).not.toBeNull();

    // the created user should be the same
    expect(updatedSearch.createdBy).toBe(user.id);
    expect(createdSearch.createdBy).toBe(updatedSearch.createdBy);

    // the created date should also remain the same
    expect(updatedSearch.createdAt).not.toBeNull();
    expect(createdSearch.createdAt).toEqual(updatedSearch.createdAt);

    // the updated date should be more recent than the created date
    expect(updatedSearch.updatedAt.getTime()).toBeGreaterThan(
      createdSearch.updatedAt.getTime(),
    );
  });

  test('should not allow edition for a search created by a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    const searchCreatedByAnotherUser = await createSearchThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .post('/api/trpc/searches.editSearch')
      .send({
        json: {
          id: searchCreatedByAnotherUser.id,
          name: 'my search',
        } satisfies EditSearchSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // search should remain the same
    const [updatedSearch] = await db.select().from(schema.searches).limit(1);
    expect(updatedSearch.content).to.deep.equal(
      searchCreatedByAnotherUser.content,
    );
    expect(updatedSearch.name).toEqual(searchCreatedByAnotherUser.name);
    expect(updatedSearch.createdAt).toEqual(
      searchCreatedByAnotherUser.createdAt,
    );
    expect(updatedSearch.updatedAt).toEqual(
      searchCreatedByAnotherUser.updatedAt,
    );
    expect(updatedSearch.createdBy).toBe(searchCreatedByAnotherUser.createdBy);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/searches.editSearch')
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('searches.searchNotes', () => {
  test('should be correctly handled [string] operator "="', async () => {
    if (!app) throw new Error('app not started');

    const { authCookie } = await createAndSignInUser(app);

    const noteA = await createNoteThroughApi({ app, authCookie });
    const noteB = await createNoteThroughApi({ app, authCookie });

    const { tag } = await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: { name: 'my-tag', noteId: noteA.id, type: 'string' },
    });

    await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: { name: 'not-my-tag', noteId: noteB.id, type: 'string' },
    });

    const res = await supertest(app!)
      .get('/api/trpc/searches.searchNotes')
      .query({
        input: JSON.stringify({
          json: {
            query: [{ tagId: tag.id, type: 'string', operator: { type: '=' } }],
          } satisfies SearchNotesSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    expect(res.body.result.data.json.notes).to.deep.equal([
      {
        ...noteA,
        createdAt: noteA.createdAt.toISOString(),
        updatedAt: noteA.createdAt.toISOString(),
      },
    ]);
  });

  test.each([
    { valueA: 9, valueB: 10, operator: { type: '<', value: 10 } },
    { valueA: 10, valueB: 10.1, operator: { type: '<=', value: 10 } },
    { valueA: 10, valueB: 9, operator: { type: '=', value: 10 } },
    { valueA: 10, valueB: 9, operator: { type: '>', value: 9 } },
    { valueA: 10.1, valueB: 9.99, operator: { type: '>=', value: 10 } },
  ] as const satisfies {
    valueA: number;
    valueB: number;
    operator: NumberOperatorsType;
  }[])(
    'should correctly handle search considering number tags with query: $operator',
    async ({ valueA, valueB, operator }) => {
      if (!app) throw new Error('app not started');

      const { authCookie } = await createAndSignInUser(app);

      const noteA = await createNoteThroughApi({ app, authCookie });
      const noteB = await createNoteThroughApi({ app, authCookie });

      const { tag } = await createNoteTagThroughApi({
        app,
        authCookie,
        noteTag: {
          name: 'my-tag',
          noteId: noteA.id,
          value: valueA,
          type: 'number',
        },
      });

      await createNoteTagThroughApi({
        app,
        authCookie,
        noteTag: {
          name: 'my-tag',
          noteId: noteB.id,
          value: valueB,
          type: 'number',
        },
      });

      const res = await supertest(app!)
        .get('/api/trpc/searches.searchNotes')
        .query({
          input: JSON.stringify({
            json: {
              query: [{ tagId: tag.id, type: 'number', operator }],
            } satisfies SearchNotesSchemaType,
          }),
        })
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);

      expect(res.body.result.data.json.notes).to.deep.equal([
        {
          ...noteA,
          createdAt: noteA.createdAt.toISOString(),
          updatedAt: noteA.createdAt.toISOString(),
        },
      ]);
    },
  );

  test.each([
    { valueA: true, valueB: false, operator: { type: '=', value: true } },
    { valueA: false, valueB: true, operator: { type: '=', value: false } },
  ] as const satisfies {
    valueA: boolean;
    valueB: boolean;
    operator: BooleanOperatorsType;
  }[])(
    'should correctly handle search considering boolean tags with query: $operator',
    async ({ valueA, valueB, operator }) => {
      if (!app) throw new Error('app not started');

      const { authCookie } = await createAndSignInUser(app);

      const noteA = await createNoteThroughApi({ app, authCookie });
      const noteB = await createNoteThroughApi({ app, authCookie });

      const { tag } = await createNoteTagThroughApi({
        app,
        authCookie,
        noteTag: {
          name: 'my-tag',
          noteId: noteA.id,
          value: valueA,
          type: 'boolean',
        },
      });

      await createNoteTagThroughApi({
        app,
        authCookie,
        noteTag: {
          name: 'my-tag',
          noteId: noteB.id,
          value: valueB,
          type: 'boolean',
        },
      });

      const res = await supertest(app!)
        .get('/api/trpc/searches.searchNotes')
        .query({
          input: JSON.stringify({
            json: {
              query: [{ tagId: tag.id, type: 'boolean', operator }],
            } satisfies SearchNotesSchemaType,
          }),
        })
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);

      expect(res.body.result.data.json.notes).to.deep.equal([
        {
          ...noteA,
          createdAt: noteA.createdAt.toISOString(),
          updatedAt: noteA.createdAt.toISOString(),
        },
      ]);
    },
  );

  test.each([
    {
      valueA: '2025-11-10',
      valueB: '2025-11-11',
      operator: { type: '<', value: '2025-11-11' },
    },
    {
      valueA: '2025-11-10',
      valueB: '2025-11-11',
      operator: { type: '<=', value: '2025-11-10' },
    },
    {
      valueA: '2025-11-10',
      valueB: '2025-11-09',
      operator: { type: '=', value: '2025-11-10' },
    },
    {
      valueA: '2025-11-10',
      valueB: '2025-11-09',
      operator: { type: '>', value: '2025-11-09' },
    },
    {
      valueA: '2025-11-10',
      valueB: '2025-11-09',
      operator: { type: '>=', value: '2025-11-10' },
    },
  ] as const satisfies {
    valueA: string;
    valueB: string;
    operator: DateOperatorsType;
  }[])(
    'should correctly handle search considering date tags with query: $operator',
    async ({ valueA, valueB, operator }) => {
      if (!app) throw new Error('app not started');

      const { authCookie } = await createAndSignInUser(app);

      const noteA = await createNoteThroughApi({ app, authCookie });
      const noteB = await createNoteThroughApi({ app, authCookie });

      const { tag } = await createNoteTagThroughApi({
        app,
        authCookie,
        noteTag: {
          name: 'my-tag',
          noteId: noteA.id,
          value: valueA,
          type: 'date',
        },
      });

      await createNoteTagThroughApi({
        app,
        authCookie,
        noteTag: {
          name: 'my-tag',
          noteId: noteB.id,
          value: valueB,
          type: 'date',
        },
      });

      const res = await supertest(app!)
        .get('/api/trpc/searches.searchNotes')
        .query({
          input: JSON.stringify({
            json: {
              query: [{ tagId: tag.id, type: 'date', operator }],
            } satisfies SearchNotesSchemaType,
          }),
        })
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);

      expect(res.body.result.data.json.notes).to.deep.equal([
        {
          ...noteA,
          createdAt: noteA.createdAt.toISOString(),
          updatedAt: noteA.createdAt.toISOString(),
        },
      ]);
    },
  );

  test('should not return deleted notes by default', async () => {
    if (!app) throw new Error('app not started');

    const { authCookie } = await createAndSignInUser(app);

    const noteA = await createNoteThroughApi({ app, authCookie });
    const noteB = await createNoteThroughApi({ app, authCookie });

    await softDeleteNotesThroughApi({ app, authCookie, noteIds: [noteA.id] });

    const res = await supertest(app!)
      .get('/api/trpc/searches.searchNotes')
      .query({
        input: JSON.stringify({
          json: {
            query: [],
          } satisfies SearchNotesSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    expect(res.body.result.data.json.notes).to.deep.equal([
      {
        ...noteB,
        createdAt: noteB.createdAt.toISOString(),
        updatedAt: noteB.createdAt.toISOString(),
      },
    ]);
  });

  test('should return deleted notes if requested in the query', async () => {
    if (!app) throw new Error('app not started');

    const { authCookie } = await createAndSignInUser(app);

    const noteA = await createNoteThroughApi({ app, authCookie });
    const noteB = await createNoteThroughApi({ app, authCookie });

    await softDeleteNotesThroughApi({
      app,
      authCookie,
      noteIds: [noteA.id, noteB.id],
    });

    await db
      .update(schema.notes)
      .set({ deletedAt: new Date(2025, 0, 1) })
      .where(eq(schema.notes.id, noteA.id));
    const [updatedNoteB] = await db
      .update(schema.notes)
      .set({ deletedAt: new Date(2024, 0, 1) })
      .where(eq(schema.notes.id, noteB.id))
      .returning();

    const res = await supertest(app!)
      .get('/api/trpc/searches.searchNotes')
      .query({
        input: JSON.stringify({
          json: {
            query: [
              {
                field: 'deleted',
                type: 'date',
                operator: { type: '<', value: '2025-01-01' },
              },
            ],
          } satisfies SearchNotesSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    expect(res.body.result.data.json.notes).to.deep.equal([
      {
        ...updatedNoteB,
        createdAt: updatedNoteB.createdAt.toISOString(),
        deletedAt: updatedNoteB.deletedAt?.toISOString(),
        updatedAt: updatedNoteB.updatedAt.toISOString(),
      },
    ]);
  });

  test('should correctly handle search considering multiple operators', async () => {
    if (!app) throw new Error('app not started');

    const { authCookie } = await createAndSignInUser(app);

    const noteA = await createNoteThroughApi({ app, authCookie });
    const noteB = await createNoteThroughApi({ app, authCookie });

    const {
      notes: [updatedNoteA],
    } = await softDeleteNotesThroughApi({
      app,
      authCookie,
      noteIds: [noteA.id, noteB.id],
    });

    // Apply string tag
    const { tag: tagA } = await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'string-tag',
        noteId: noteA.id,
        type: 'string',
      },
    });

    // Apply number tag
    const { tag: tagB } = await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'number-tag',
        noteId: noteA.id,
        value: 10,
        type: 'number',
      },
    });

    await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'number-tag',
        noteId: noteB.id,
        value: 11,
        type: 'number',
      },
    });

    // Apply boolean tag
    const { tag: tagC } = await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'boolean-tag',
        noteId: noteA.id,
        value: false,
        type: 'boolean',
      },
    });

    await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'boolean-tag',
        noteId: noteB.id,
        value: true,
        type: 'boolean',
      },
    });

    // Apply date tag
    const { tag: tagD } = await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'date-tag',
        noteId: noteA.id,
        value: '2025-10-10',
        type: 'date',
      },
    });

    await createNoteTagThroughApi({
      app,
      authCookie,
      noteTag: {
        name: 'date-tag',
        noteId: noteB.id,
        value: '2025-10-09',
        type: 'date',
      },
    });

    const res = await supertest(app!)
      .get('/api/trpc/searches.searchNotes')
      .query({
        input: JSON.stringify({
          json: {
            query: [
              { tagId: tagA.id, type: 'string', operator: { type: '=' } },
              {
                tagId: tagB.id,
                type: 'number',
                operator: { type: '<=', value: 10 },
              },
              {
                tagId: tagC.id,
                type: 'boolean',
                operator: { type: '=', value: false },
              },
              {
                tagId: tagD.id,
                type: 'date',
                operator: { type: '>=', value: '2025-10-10' },
              },
              {
                field: 'deleted',
                type: 'date',
                operator: { type: '>=', value: '2020-01-01' },
              },
            ],
          } satisfies SearchNotesSchemaType,
        }),
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    expect(res.body.result.data.json.notes).to.deep.equal([
      {
        ...updatedNoteA,
        createdAt: updatedNoteA.createdAt.toISOString(),
        deletedAt: updatedNoteA.deletedAt?.toISOString(),
        updatedAt: updatedNoteA.updatedAt.toISOString(),
      },
    ]);
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!).get('/api/trpc/searches.searchNotes');

    expect(res.status).toBe(401);
  });
});

describe('searches.undoSoftDeletedSearches', () => {
  test('should be correctly handled', async () => {
    const { authCookie, user } = await createAndSignInUser(app!);

    const createdSearch = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    // soft deletes searches
    await softDeleteSearchesThroughApi({
      app: app!,
      authCookie,
      searchIds: [createdSearch.id],
    });

    const res = await supertest(app!)
      .post('/api/trpc/searches.undoSoftDeletedSearches')
      .send({
        json: {
          searchIds: [createdSearch.id],
        } satisfies UndoSoftDeletedSearchesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);

    const [updatedSearch] = await db.select().from(schema.searches).limit(1);

    expect(updatedSearch.content).to.deep.equal(createdSearch.content);
    expect(updatedSearch.createdAt).not.toBeNull();
    expect(updatedSearch.updatedAt).not.toBeNull();
    expect(updatedSearch.deletedAt).toBeNull();

    // the created user should be the same
    expect(updatedSearch.createdBy).toBe(user.id);
    expect(createdSearch.createdBy).toBe(updatedSearch.createdBy);

    // the created date should also remain the same
    expect(updatedSearch.createdAt).not.toBeNull();
    expect(createdSearch.createdAt).toEqual(updatedSearch.createdAt);

    // the deleted user should be present
    expect(updatedSearch.deletedBy).toBeNull();

    // the updated date should be more recent than the created date
    expect(updatedSearch.updatedAt.getTime()).toBeGreaterThan(
      createdSearch.updatedAt.getTime(),
    );
  });

  test('should not allow undo soft deletion for a search created by a different user', async () => {
    const { authCookie: authCookieForAnotherUser } = await createAndSignInUser(
      app!,
      {
        name: 'Another User',
        email: 'another@example.com',
      },
    );

    const searchCreatedByAnotherUser = await createSearchThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
    });

    await softDeleteSearchesThroughApi({
      app: app!,
      authCookie: authCookieForAnotherUser,
      searchIds: [searchCreatedByAnotherUser.id],
    });

    const { authCookie } = await createAndSignInUser(app!);

    const searchCreatedByCurrentUser = await createSearchThroughApi({
      app: app!,
      authCookie,
    });

    await softDeleteSearchesThroughApi({
      app: app!,
      authCookie,
      searchIds: [searchCreatedByCurrentUser.id],
    });

    const res = await supertest(app!)
      .post('/api/trpc/searches.undoSoftDeletedSearches')
      .send({
        json: {
          searchIds: [
            searchCreatedByCurrentUser.id,
            searchCreatedByAnotherUser.id,
          ],
        } satisfies UndoSoftDeletedSearchesSchemaType,
      })
      .set('Cookie', authCookie);

    expect(res.status).toBe(401);

    // searches should remain the same
    const updatedSearches = await db.select().from(schema.searches).limit(2);

    expect(updatedSearches).to.deep.equal([
      {
        ...searchCreatedByAnotherUser,
        deletedAt: updatedSearches[0].deletedAt,
        deletedBy: updatedSearches[0].deletedBy,
        updatedAt: updatedSearches[0].updatedAt,
      },
      {
        ...searchCreatedByCurrentUser,
        deletedAt: updatedSearches[1].deletedAt,
        deletedBy: updatedSearches[1].deletedBy,
        updatedAt: updatedSearches[1].updatedAt,
      },
    ]);

    expect(updatedSearches[0].deletedAt).not.toBeNull();
    expect(updatedSearches[0].deletedBy).not.toBeNull();
    expect(updatedSearches[1].deletedAt).not.toBeNull();
    expect(updatedSearches[1].deletedBy).not.toBeNull();
  });

  test('should be a protected route', async () => {
    const res = await supertest(app!)
      .post('/api/trpc/searches.undoSoftDeletedSearches')
      .send({});

    expect(res.status).toBe(401);
  });
});
