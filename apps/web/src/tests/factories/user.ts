import { type User } from 'better-auth';

export const createUser = (data: Partial<User> = {}): User => ({
  id: '123456',
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'some@example.com',
  emailVerified: false,
  name: 'Some Name',
  image: 'https://www.example.com',
  ...data,
});
