import { type Server } from 'http';
import supertest from 'supertest';

import {
  type CreateNoteTagSchemaType,
  type CreateTagSchemaType,
} from '@api/schemas/tags';
import { createNoteThroughApi } from './noteUtils';

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

export const createNoteTagThroughApi = async ({
  app,
  authCookie,
  noteTag = { name: 'my-tag', noteId: '', type: 'string' },
}: {
  app: Server;
  authCookie: string;
  noteTag?: CreateNoteTagSchemaType;
}) => {
  let noteId = noteTag.noteId;

  if (!noteId) {
    const response = await createNoteThroughApi({ app, authCookie });
    noteId = response.body.result.data.json.note.id;
  }

  return supertest(app!)
    .post('/api/trpc/tags.createNoteTag')
    .send({ json: { ...noteTag, noteId } })
    .set('Cookie', authCookie);
};
