import { faker } from '@faker-js/faker/locale/en';

import { type Search } from '@/models/searches';
import { searchMock, type SearchMockSchemaType } from '../models/searches';
import { createUserMock } from './user';

export const createSearch = (data: Partial<Search> = {}): Search => ({
  content: { query: [] },
  createdAt: faker.date.past(),
  createdBy: faker.string.uuid(),
  deletedAt: null,
  deletedBy: null,
  favorited: false,
  id: faker.string.uuid(),
  name: null,
  updatedAt: faker.date.recent(),
  updatedBy: faker.string.uuid(),
  ...data,
});

export const createSearchMock = async ({
  createdByUser,
  updatedByUser,
  ...data
}: Partial<SearchMockSchemaType> = {}) => {
  const createdByUserRelation = createdByUser ?? (await createUserMock());
  const updatedByUserRelation = updatedByUser ?? (await createUserMock());

  return searchMock.create({
    ...createSearch(data),
    createdByUser: createdByUserRelation,
    createdBy: createdByUserRelation.id,
    updatedByUser: updatedByUserRelation,
    updatedBy: updatedByUserRelation.id,
  });
};
