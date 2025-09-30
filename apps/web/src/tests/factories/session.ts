import { type Session } from 'better-auth';

export const createSession = (data: Partial<Session> = {}): Session => ({
  id: '123456',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '123456',
  expiresAt: new Date(),
  token: 'abc123',
  ipAddress: '127.0.01',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  ...data,
});
