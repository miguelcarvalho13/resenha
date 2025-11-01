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
  id: faker.string.uuid(),
  updatedAt: faker.date.recent(),
  ...data,
});

export const createNoteMock = async ({
  createdByUser,
  ...data
}: Partial<NoteMockSchemaType> = {}) => {
  const createdByUserRelation = createdByUser ?? (await createUserMock());

  return noteMock.create({
    ...createNoteForFindAll(data),
    createdByUser: createdByUserRelation,
    createdBy: createdByUserRelation.id,
  });
};
