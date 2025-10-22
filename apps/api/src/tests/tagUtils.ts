import { type Server } from 'http';
import supertest from 'supertest';

import { type CreateTagSchemaType } from '@api/schemas/tags';

export const createTagThroughApi = ({
  app,
  authCookie,
  tag = { name: 'my-tag', type: 'string' },
}: {
  app: Server;
  authCookie: string;
  tag?: CreateTagSchemaType;
}) =>
  supertest(app!)
    .post('/api/trpc/tags.createTag')
    .send({ json: tag })
    .set('Cookie', authCookie);
