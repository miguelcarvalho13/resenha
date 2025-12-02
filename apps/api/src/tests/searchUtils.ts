import { eq } from 'drizzle-orm';
import { type Server } from 'http';
import supertest from 'supertest';

import { db } from '@api/db';
import { searches } from '@api/db/schema';
import { type CreateSearchSchemaType } from '@api/schemas/searches';

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
