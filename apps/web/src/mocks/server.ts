import { createNoteMock } from './factories/notes';
import { createSessionMock } from './factories/session';
import { createNoteTagMock, createTagMock } from './factories/tags';
import { createUserMock } from './factories/user';

export const server = {
  createNoteMock,
  createNoteTagMock,
  createSessionMock,
  createTagMock,
  createUserMock,
};
