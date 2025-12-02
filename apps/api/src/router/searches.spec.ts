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
  type NumberOperatorsType,
  type SearchNotesSchemaType,
} from '@api/schemas/searches';
import { startApp } from '@api/server';
import {
  createNoteThroughApi,
  softDeleteNotesThroughApi,
} from '@api/tests/noteUtils';
import { createAndSignInUser } from '@api/tests/sessionUtils';
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
