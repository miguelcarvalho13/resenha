import { and, eq } from 'drizzle-orm';
import { type Server } from 'http';
import supertest from 'supertest';

import { db } from '@api/db';
import { noteTags, tags } from '@api/db/schema';
import {
  type CreateNoteTagSchemaType,
  type CreateTagSchemaType,
} from '@api/adapters/driver/trpc/forTagsAndNoteTagsTrpcInput';
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

/**
 * If `noteId` is not provided, it'll create a note automatically.
 */
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
    const note = await createNoteThroughApi({ app, authCookie });
    noteId = note.id;
  }

  const response = await supertest(app!)
    .post('/api/trpc/tags.createNoteTag')
    .send({ json: { ...noteTag, noteId } })
    .set('Cookie', authCookie);

  const [createdTag] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, response.body.result.data.json.tag.id))
    .limit(1);

  const [createdNoteTag] = await db
    .select()
    .from(noteTags)
    .where(and(eq(noteTags.tagId, createdTag.id), eq(noteTags.noteId, noteId)))
    .limit(1);

  return { tag: createdTag, noteTag: createdNoteTag };
};
