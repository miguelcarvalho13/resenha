import { test as testBase } from 'vitest';

import { worker } from '@/mocks/browser.ts';
import { noteMock } from '@/mocks/models/notes';
import { sessionMock } from '@/mocks/models/sessions';
import { noteTagMock, tagMock } from '@/mocks/models/tags';
import { userMock } from '@/mocks/models/users';

export const test = testBase.extend({
  worker: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      // Start the worker before the test.
      await worker.start();

      // Expose the worker object on the test's context.
      await use(worker);

      // Remove any request handlers added in individual test cases.
      // This prevents them from affecting unrelated tests.
      worker.resetHandlers();

      // Remove data created between tests
      noteTagMock.clear();
      tagMock.clear();
      noteMock.clear();
      sessionMock.clear();
      userMock.clear();
    },
    {
      auto: true,
    },
  ],
});
