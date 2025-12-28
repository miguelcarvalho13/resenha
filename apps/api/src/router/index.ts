import type { DriverContext } from '@api/domain/context';
import { globalConfigRouter } from '@api/adapters/driver/forGlobalConfigTrpc';
import { helloRouter } from '@api/router/hello';
import { notesRouter } from '@api/adapters/driver/forNotesTrpc';
import { searchesRouter } from '@api/router/searches';
import { tagsRouter } from '@api/adapters/driver/forTagsAndNoteTagsTrpc';
import { router } from '@api/trpc';

export const appRouter = ({
  forGlobalConfig,
  forNotes,
  forTagsAndNoteTags,
}: Pick<
  DriverContext,
  'forGlobalConfig' | 'forNotes' | 'forTagsAndNoteTags'
>) =>
  router({
    globalConfig: globalConfigRouter({ forGlobalConfig }),
    hello: helloRouter,
    notes: notesRouter({ forNotes }),
    searches: searchesRouter,
    tags: tagsRouter({ forTagsAndNoteTags }),
  });

export type AppRouter = ReturnType<typeof appRouter>;
