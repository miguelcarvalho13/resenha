import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { appRouter } from '@api/router';
import { createTRPCContext } from '@api/trpc';
import { auth } from '@api/auth';

export function startApp({
  port = process.env.PORT || 3000,
}: {
  port?: string | number;
} = {}) {
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
      router: appRouter,
      createContext: ({ req }) => createTRPCContext({ headers: req.headers }),
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
