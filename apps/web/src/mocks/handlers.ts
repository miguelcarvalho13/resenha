import {
  getFindAllNotesHandler,
  postCreateNoteHandler,
  postEditNoteHandler,
} from './routes/notes';
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

  // tags
  getFindAllTagsHandler(),
  getFindAllNoteTagsHandler(),
  postCreateNoteTagHandler(),
  postDeleteNoteTagHandler(),
  postEditNoteTagHandler(),
];
