import type { DriverContext } from '@api/domain/context';
import { globalConfigRouter } from '@api/router/globalConfig';
import { helloRouter } from '@api/router/hello';
import { notesRouter } from '@api/router/notes';
import { searchesRouter } from '@api/router/searches';
import { tagsRouter } from '@api/router/tags';
import { router } from '@api/trpc';

export const appRouter = ({
  forGlobalConfig,
}: Pick<DriverContext, 'forGlobalConfig'>) =>
  router({
    globalConfig: globalConfigRouter({ forGlobalConfig }),
    hello: helloRouter,
    notes: notesRouter,
    searches: searchesRouter,
    tags: tagsRouter,
  });

export type AppRouter = ReturnType<typeof appRouter>;
