import { helloRouter } from '@api/router/hello';
import { notesRouter } from '@api/router/notes';
import { searchesRouter } from '@api/router/searches';
import { tagsRouter } from '@api/router/tags';
import { router } from '@api/trpc';

export const appRouter = router({
  hello: helloRouter,
  notes: notesRouter,
  tags: tagsRouter,
  searches: searchesRouter,
});

export type AppRouter = typeof appRouter;
