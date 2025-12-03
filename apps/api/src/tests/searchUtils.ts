import { eq, inArray } from 'drizzle-orm';
import { type Server } from 'http';
import supertest from 'supertest';

import { db } from '@api/db';
import { searches } from '@api/db/schema';
import {
  type CreateSearchSchemaType,
  type SoftDeleteSearchesSchemaType,
} from '@api/schemas/searches';

export const createSearchThroughApi = async ({
  app,
  authCookie,
  note = { content: { query: [] } },
}: {
  app: Server;
  authCookie: string;
  note?: CreateSearchSchemaType;
}) => {
  const response = await supertest(app!)
    .post('/api/trpc/searches.createSearch')
    .send({ json: note })
    .set('Cookie', authCookie);

  const [createdSearch] = await db
    .select()
    .from(searches)
    .where(eq(searches.id, response.body.result.data.json.search.id))
    .limit(1);

  return createdSearch;
};

export const softDeleteSearchesThroughApi = async ({
  app,
  authCookie,
  searchIds,
}: {
  app: Server;
  authCookie: string;
  searchIds: string[];
}) => {
  await supertest(app!)
    .post('/api/trpc/searches.softDeleteSearches')
    .send({
      json: {
        searchIds,
      } satisfies SoftDeleteSearchesSchemaType,
    })
    .set('Cookie', authCookie);

  const softDeletedSearches = await db
    .select()
    .from(searches)
    .where(inArray(searches.id, searchIds));

  return { notes: softDeletedSearches };
};
