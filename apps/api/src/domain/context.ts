import type { ForGlobalConfigDrivenPort } from '@api/domain/ports/driven/forGlobalConfig';
import type { ForObtainingNotesDrivenPort } from './ports/driven/forObtainingNotes';
import type { ForStoringSearchesDrivenPort } from './ports/driven/forStoringSearches';
import type { ForStoringTagsAndNoteTagsDrivenPort } from './ports/driven/forStoringTagsAndNoteTags';
import type { ForUpdatingNotesDrivenPort } from './ports/driven/forUpdatingNotes';
import type { ForGlobalConfigDriverPort } from './ports/driver/forGlobalConfig';
import type { ForNotesDriverPort } from './ports/driver/forNotes';
import type { ForSearchesDriverPort } from './ports/driver/forSearches';
import type { ForTagsAndNoteTagsDriverPort } from './ports/driver/forTagsAndNoteTags';

export type DrivenContext = {
  forGlobalConfig: ForGlobalConfigDrivenPort;

  forObtainingNotes: ForObtainingNotesDrivenPort;
  forUpdatingNotes: ForUpdatingNotesDrivenPort;

  forStoringTagsAndNoteTags: ForStoringTagsAndNoteTagsDrivenPort;

  forStoringSearches: ForStoringSearchesDrivenPort;
};

export type DriverContext = {
  forGlobalConfig: ReturnType<ForGlobalConfigDriverPort>;
  forNotes: ReturnType<ForNotesDriverPort>;
  forTagsAndNoteTags: ReturnType<ForTagsAndNoteTagsDriverPort>;
  forSearches: ReturnType<ForSearchesDriverPort>;
};
