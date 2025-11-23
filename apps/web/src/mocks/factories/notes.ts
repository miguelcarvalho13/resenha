import { faker } from '@faker-js/faker/locale/en';

import { type NoteForFindAll } from '@/models/notes';
import { noteMock, type NoteMockSchemaType } from '@/mocks/models/notes';
import { createUserMock } from './user';

export const createNoteForFindAll = (
  data: Partial<NoteForFindAll> = {},
): NoteForFindAll => ({
  content: faker.lorem.paragraph(),
  createdAt: faker.date.past(),
  createdBy: faker.string.uuid(),
  deletedAt: null,
  deletedBy: null,
  id: faker.string.uuid(),
  updatedAt: faker.date.recent(),
  updatedBy: faker.string.uuid(),
  ...data,
});

export const createNoteMock = async ({
  createdByUser,
  updatedByUser,
  ...data
}: Partial<NoteMockSchemaType> = {}) => {
  const createdByUserRelation = createdByUser ?? (await createUserMock());
  const updatedByUserRelation = updatedByUser ?? (await createUserMock());

  return noteMock.create({
    ...createNoteForFindAll(data),
    createdByUser: createdByUserRelation,
    createdBy: createdByUserRelation.id,
    updatedByUser: updatedByUserRelation,
    updatedBy: updatedByUserRelation.id,
  });
};
