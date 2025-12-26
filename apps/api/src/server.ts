import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import ForGlobalConfigDrivenAdapter from '@api/adapters/driven/forGlobalConfig';
import ForObtainingNotesDrivenAdapter from '@api/adapters/driven/forObtainingNotes';
import ForUpdatingNotesDrivenAdapter from '@api/adapters/driven/forUpdatingNotes';
import { createAuth } from '@api/auth';
import type { DrivenContext, DriverContext } from '@api/domain/context';
import { forGlobalConfigUseCase } from '@api/domain/useCases/forGlobalConfig';
import { forNotesUseCase } from '@api/domain/useCases/forNotes';
import { appRouter } from '@api/router';
import { createTRPCContext } from '@api/trpc';

export async function startApp({
  port = process.env.PORT || 3000,
}: {
  port?: string | number;
} = {}) {
  const drivenContext: DrivenContext = {
    forGlobalConfig: ForGlobalConfigDrivenAdapter,
    forObtainingNotes: ForObtainingNotesDrivenAdapter,
    forUpdatingNotes: ForUpdatingNotesDrivenAdapter,
  };

  const driverContext: DriverContext = {
    forGlobalConfig: forGlobalConfigUseCase(drivenContext),
    forNotes: forNotesUseCase(drivenContext),
  };

  const auth = createAuth(await drivenContext.forGlobalConfig.findAll());
  const app = express();

  app.use(
    cors({
      origin: process.env.WEB_APP_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }),
  );

  app.all('/api/auth/*', toNodeHandler(auth));

  app.get('/api/hello', (req, res) => res.send('hello world'));

  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter(driverContext),
      createContext: ({ req }) =>
        createTRPCContext({ auth, headers: req.headers }),
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ path, error }) => {
              console.error(
                `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
              );
            }
          : undefined,
    }),
  );

  // For testing purposes, wait-on requests '/'
  app.get('/', (req, res) => res.send('Server is running!'));

  return app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
  });
}

// Only automatically runs if not in test mode
export const app = process.env.VITEST ? null : startApp();
