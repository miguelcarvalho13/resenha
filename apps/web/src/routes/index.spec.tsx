import { http, HttpResponse } from 'msw';
import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import { getSessionHandler } from '@/mocks/handlers';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { createUser } from '@/tests/factories/user';

test('should correctly render the side navbar', async ({ worker }) => {
  (worker as SetupWorker).use(getSessionHandler());

  const { getByRole } = await renderWithRouter();

  const navbar = getByRole('navigation');

  const links = navbar.getByRole('link');

  expect(links.elements()).toHaveLength(4);

  // Recent
  expect(links.nth(0)).toHaveTextContent('Recent');
  expect(links.nth(0)).toHaveAttribute('href', '/');

  // // My searches
  expect(links.nth(1)).toHaveTextContent('My Searches');
  expect(links.nth(1)).toHaveAttribute('href', '/searches');

  // // Trash
  expect(links.nth(2)).toHaveTextContent('Trash');
  expect(links.nth(2)).toHaveAttribute('href', '/trash');

  // // Configurations
  expect(links.nth(3)).toHaveTextContent('Configurations');
  expect(links.nth(3)).toHaveAttribute('href', '/config');
});

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
