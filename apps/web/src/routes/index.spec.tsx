import { http, HttpResponse } from 'msw';
import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import { getSessionHandler } from '@/mocks/handlers';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { createUser } from '@/tests/factories/user';

test('should correctly display user menu in the header', async ({ worker }) => {
  (worker as SetupWorker).use(
    getSessionHandler({ user: createUser({ name: 'Some Name' }) }),
  );

  const { getByRole } = await renderWithRouter();

  const header = getByRole('banner');

  // click in the button with user initials
  await header.getByRole('button', { name: /SN/ }).click();

  const menu = getByRole('menu', { name: /SN/ });

  expect(menu.getByRole('menuitem').elements()).toHaveLength(1);
  expect(menu.getByRole('menuitem').nth(0)).toHaveTextContent('Logout');
});

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

  await getByRole('banner').getByRole('button', { name: /SN/ }).click();
  await getByRole('menu', { name: /SN/ })
    .getByRole('menuitem', { name: /Logout/ })
    .click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/sign-in'));
});
