import { test as testBase } from 'vitest';
import { type Server } from 'http';
import { reset } from 'drizzle-seed';

import { startApp } from '@api/server';
import { db } from '@api/db';
import * as schema from '@api/db/schema';

interface ExtendedTestFixtures {
  app: Server;
}

export const test = testBase.extend<ExtendedTestFixtures>({
  app: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const app: Server = startApp({ port: 3001 });

      // Expose the worker object on the test's context.
      await use(app);

      app.close();
      await reset(db, schema);
    },
    {
      auto: true,
    },
  ],
});
