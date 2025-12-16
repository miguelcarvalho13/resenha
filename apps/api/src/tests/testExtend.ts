import { reset } from 'drizzle-seed';
import { type Server } from 'http';
import { test as testBase, vi } from 'vitest';

import { db } from '@api/db';
import * as schema from '@api/db/schema';
import { startApp } from '@api/server';

interface ExtendedTestFixtures {
  env: {
    FEATURE_ENABLE_EMAIL_SIGNUP: '1' | '0';
  };
  app: Server;
}

export const test = testBase.extend<ExtendedTestFixtures>({
  // scoped environment variables for the "app" fixture
  // this can be modified before a test using test.scope(...)
  env: {
    FEATURE_ENABLE_EMAIL_SIGNUP: '1',
  },

  app: [
    // eslint-disable-next-line no-empty-pattern
    async ({ env }, use) => {
      Object.entries(env).map(([name, value]) => vi.stubEnv(name, value));
      const app: Server = startApp({ port: 3001 });

      // Expose the worker object on the test's context.
      await use(app);

      app.close();
      await reset(db, schema);
      vi.unstubAllEnvs();
    },
    {
      auto: true,
    },
  ],
});
