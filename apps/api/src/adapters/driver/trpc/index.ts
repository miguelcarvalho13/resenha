import type { DriverContext } from '@api/domain/context';
import { globalConfigRouter } from '@api/adapters/driver/trpc/forGlobalConfigTrpc';
import { notesRouter } from '@api/adapters/driver/trpc/forNotesTrpc';
import { searchesRouter } from '@api/adapters/driver/trpc/forSearchesTrpc';
import { tagsRouter } from '@api/adapters/driver/trpc/forTagsAndNoteTagsTrpc';
import { router } from '@api/trpc';

export const appRouter = ({
  forGlobalConfig,
  forNotes,
  forTagsAndNoteTags,
  forSearches,
}: Pick<
  DriverContext,
  'forGlobalConfig' | 'forNotes' | 'forTagsAndNoteTags' | 'forSearches'
>) =>
  router({
    globalConfig: globalConfigRouter({ forGlobalConfig }),
    notes: notesRouter({ forNotes }),
    searches: searchesRouter({ forSearches }),
    tags: tagsRouter({ forTagsAndNoteTags }),
  });

export type AppRouter = ReturnType<typeof appRouter>;
