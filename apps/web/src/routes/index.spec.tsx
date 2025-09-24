import { http, HttpResponse } from 'msw';
import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import { getSessionHandler } from '@/mocks/handlers';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should be redirected to /sign-in upon clicking on "Logout"', async ({
  worker,
}) => {
  (worker as SetupWorker).use(
    http.post(
      '/api/auth/sign-out',
      () => new HttpResponse(null, { status: 200 }),
    ),
    getSessionHandler(),
  );

  const { getByRole } = await renderWithRouter();

  await getByRole('button', { name: /Logout/ }).click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/sign-in'));
});
