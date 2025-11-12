import {
  getFindAllNotesHandler,
  postCreateNoteHandler,
  postEditNoteHandler,
} from './routes/notes';
import { getSearchNotesHandler } from './routes/searches';
import {
  getSessionHandler,
  postSignInWithEmail,
  postSignOut,
  postSignUpWithEmail,
} from './routes/session';
import {
  getFindAllNoteTagsHandler,
  getFindAllTagsHandler,
  postCreateNoteTagHandler,
  postDeleteNoteTagHandler,
  postEditNoteTagHandler,
} from './routes/tags';

export const handlers = [
  // session
  getSessionHandler(),
  postSignInWithEmail(),
  postSignOut(),
  postSignUpWithEmail(),

  // notes
  getFindAllNotesHandler(),
  postCreateNoteHandler(),
  postEditNoteHandler(),

  // searches
  getSearchNotesHandler(),

  // tags
  getFindAllTagsHandler(),
  getFindAllNoteTagsHandler(),
  postCreateNoteTagHandler(),
  postDeleteNoteTagHandler(),
  postEditNoteTagHandler(),
];
