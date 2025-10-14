import { type Server } from 'http';
import supertest from 'supertest';

import { type CreateNoteSchemaType } from '@api/schemas/notes';

export const createNoteThroughApi = ({
  app,
  authCookie,
  note = { content: 'Lorem Ipsum!' },
}: {
  app: Server;
  authCookie: string;
  note?: CreateNoteSchemaType;
}) =>
  supertest(app!)
    .post('/api/trpc/notes.createNote')
    .send({ json: note })
    .set('Cookie', authCookie);
