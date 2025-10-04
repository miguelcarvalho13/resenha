import { helloRouter } from '@api/router/hello';
import { notesRouter } from '@api/router/notes';
import { router } from '@api/trpc';

export const appRouter = router({
  hello: helloRouter,
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
