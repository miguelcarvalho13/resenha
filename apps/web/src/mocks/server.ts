import { createNoteMock } from './factories/notes';
import { createSessionMock } from './factories/session';
import { createNoteTagMock, createTagMock } from './factories/tags';
import { createUserMock } from './factories/user';
import { noteMock } from './models/notes';
import { sessionMock } from './models/sessions';
import { noteTagMock, tagMock } from './models/tags';
import { userMock } from './models/users';

export const server = {
  id: crypto.randomUUID(),
  timing: 0,

  // mocks
  createNoteMock,
  createNoteTagMock,
  createSessionMock,
  createTagMock,
  createUserMock,
  reset() {
    console.log('resetting mock server...');
    this.id = crypto.randomUUID();
    this.timing = 0;
    noteMock.clear();
    noteTagMock.clear();
    sessionMock.clear();
    tagMock.clear();
    userMock.clear();
  },
};
