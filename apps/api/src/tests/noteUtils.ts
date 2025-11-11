import { eq } from 'drizzle-orm';
import { type Server } from 'http';
import supertest from 'supertest';

import { db } from '@api/db';
import { notes } from '@api/db/schema';
import { type CreateNoteSchemaType } from '@api/schemas/notes';

export const createNoteThroughApi = async ({
  app,
  authCookie,
  note = { content: 'Lorem Ipsum!' },
}: {
  app: Server;
  authCookie: string;
  note?: CreateNoteSchemaType;
}) => {
  const response = await supertest(app!)
    .post('/api/trpc/notes.createNote')
    .send({ json: note })
    .set('Cookie', authCookie);

  const [createdNote] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, response.body.result.data.json.note.id))
    .limit(1);

  return createdNote;
};
