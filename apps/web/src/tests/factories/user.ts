import { faker } from '@faker-js/faker/locale/en';
import { type User } from 'better-auth';

import { userMock, type UserMockSchemaType } from '@/mocks/models/users';

export const createUser = (data: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  email: faker.internet.email(),
  emailVerified: faker.datatype.boolean(),
  name: faker.person.fullName(),
  image: faker.image.avatar(),
  ...data,
});

export const createUserMock = (data: Partial<UserMockSchemaType> = {}) =>
  userMock.create({
    ...createUser(data),
  });
