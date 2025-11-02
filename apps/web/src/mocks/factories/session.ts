import { faker } from '@faker-js/faker/locale/en';
import { type Session } from 'better-auth';

import {
  sessionMock,
  type SessionMockSchemaType,
} from '@/mocks/models/sessions';
import { createUserMock } from './user';

export const createSession = (data: Partial<Session> = {}): Session => ({
  id: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  userId: faker.string.uuid(),
  expiresAt: faker.date.future(),
  token: faker.internet.jwt(),
  ipAddress: faker.internet.ipv4(),
  userAgent: faker.internet.userAgent(),
  ...data,
});

export const createSessionMock = async ({
  user,
  ...data
}: Partial<SessionMockSchemaType> = {}) => {
  const userRelation = user ?? (await createUserMock());

  return sessionMock.create({
    ...createSession(data),
    user: userRelation,
    userId: userRelation.id,
  });
};
