import { type User } from 'better-auth';

export const createUser = (data: Partial<User> = {}): User => ({
  id: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  email: '',
  emailVerified: false,
  name: '',
  image: '',
  ...data,
});
