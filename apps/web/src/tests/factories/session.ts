import { type Session } from 'better-auth';

export const createSession = (data: Partial<Session> = {}): Session => ({
  id: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '',
  expiresAt: new Date(),
  token: '',
  ipAddress: '',
  userAgent: '',
  ...data,
});
