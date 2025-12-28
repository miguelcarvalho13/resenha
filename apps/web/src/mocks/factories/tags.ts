import { faker } from '@faker-js/faker/locale/en';

import {
  noteTagMock,
  type NoteTagMockSchemaType,
  tagMock,
  type TagMockSchemaType,
} from '@/mocks/models/tags';
import { type NoteTag, type Tag } from '@/models/tags';
import { createUserMock } from './user';
import { createNoteMock } from './notes';

export const createNoteTag = (data: Partial<NoteTag> = {}): NoteTag =>
  ({
    createdAt: faker.date.past(),
    createdBy: faker.string.uuid(),
    name: faker.word.adjective(),
    tagId: faker.string.uuid(),
    noteId: faker.string.uuid(),
    type: 'string',
    updatedAt: faker.date.recent(),
    updatedBy: faker.string.uuid(),
    value: faker.word.adjective(),
    ...data,
  }) as NoteTag;

export const createTag = (data: Partial<Tag> = {}): Tag => ({
  createdAt: faker.date.past(),
  createdBy: faker.string.uuid(),
  id: faker.string.uuid(),
  name: faker.word.adjective(),
  type: 'string',
  updatedAt: faker.date.recent(),
  updatedBy: faker.string.uuid(),
  ...data,
});

export const createTagMock = async ({
  createdByUser,
  updatedByUser,
  ...data
}: Partial<TagMockSchemaType> = {}) => {
  const createdByUserRelation = createdByUser ?? (await createUserMock());
  const updatedByUserRelation = updatedByUser ?? createdByUserRelation;

  return tagMock.create({
    ...createTag(data),
    createdBy: createdByUserRelation.id,
    createdByUser: createdByUserRelation,
    updatedBy: updatedByUserRelation.id,
    updatedByUser: updatedByUserRelation,
  });
};

export const createNoteTagMock = async ({
  note,
  tag,
  createdByUser,
  updatedByUser,
  ...data
}: Partial<NoteTagMockSchemaType> = {}) => {
  const noteTag = createNoteTag(data);
  const noteRelation = note ?? (await createNoteMock());
  const tagRelation =
    tag ??
    (await createTagMock({
      name: noteTag.name,
      type: noteTag.type,
    }));

  const createdByUserRelation = createdByUser ?? (await createUserMock());
  const updatedByUserRelation = updatedByUser ?? createdByUserRelation;

  return noteTagMock.create({
    ...noteTag,
    note: noteRelation,
    noteId: noteRelation.id,
    tag: tagRelation,
    tagId: tagRelation.id,

    createdBy: createdByUserRelation.id,
    createdByUser: createdByUserRelation,
    updatedBy: updatedByUserRelation.id,
    updatedByUser: updatedByUserRelation,
  });
};
