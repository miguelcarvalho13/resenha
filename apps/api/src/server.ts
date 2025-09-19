import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { toNodeHandler } from "better-auth/node";
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { appRouter } from '@api/router';
import { createTRPCContext } from '@api/trpc';
import { auth } from '@api/auth';


async function main() {
  const port = process.env.PORT || 3000;

  const app = express();

  app.use(cors());

  app.all("/api/auth/*", toNodeHandler(auth));

  app.get("/api/hello", (req, res) => res.send("hello world"));

  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: ({ req }) => createTRPCContext({ headers: req.headers }),
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ path, error }) => {
              console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
            }
          : undefined,
    })
  );

  // For testing purposes, wait-on requests '/'
  app.get('/', (req, res) => res.send('Server is running!'));

  app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
  });
}

void main();
