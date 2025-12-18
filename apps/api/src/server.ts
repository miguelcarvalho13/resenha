import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { createAuth } from '@api/auth';
import { appRouter } from '@api/router';
import { handleInvitesMiddleware } from '@api/router/auth';
import { createTRPCContext } from '@api/trpc';

export function startApp({
  port = process.env.PORT || 3000,
}: {
  port?: string | number;
} = {}) {
  const enableEmailSignup =
    process.env.FEATURE_ENABLE_EMAIL_SIGNUP === '1' ||
    process.env.FEATURE_ENABLE_EMAIL_SIGNUP?.toLocaleLowerCase() === 'true';

  const auth = createAuth({ enableEmailSignup });
  const app = express();
  const jsonParser = express.json();

  app.use(
    cors({
      origin: process.env.WEB_APP_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }),
  );

  app.use('/api/auth/sign-up/*', jsonParser, handleInvitesMiddleware);

  app.all('/api/auth/*', toNodeHandler(auth));

  app.get('/api/hello', (req, res) => res.send('hello world'));

  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
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
