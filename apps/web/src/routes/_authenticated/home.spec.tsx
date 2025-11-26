import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNavbarPO } from '@/tests/pages/navbar';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly render the side navbar', async () => {
  await server.createSessionMock({
    user: await server.createUserMock({ name: 'Some Name' }),
  });

  await renderWithRouter();
  const { navbarLinks: links } = createNavbarPO();

  await vi.waitFor(() => expect(links.elements()).toHaveLength(4));

  // Recent
  await expect.element(links.nth(0)).toHaveTextContent('Recent');
  await expect.element(links.nth(0)).toHaveAttribute('href', '/home');

  // // My searches
  await expect.element(links.nth(1)).toHaveTextContent('My Searches');
  await expect.element(links.nth(1)).toHaveAttribute('href', '/searches');

  // // Trash
  await expect.element(links.nth(2)).toHaveTextContent('Trash');
  expect(links.nth(2)).toHaveAttribute('href', '/trash');

  // // Configurations
  await expect.element(links.nth(3)).toHaveTextContent('Configurations');
  await expect.element(links.nth(3)).toHaveAttribute('href', '/config');
});

test('should correctly display user menu in the header', async () => {
  await server.createSessionMock({
    user: await server.createUserMock({ name: 'Some Name' }),
  });

  await renderWithRouter();
  const { header } = createNavbarPO();

  // click in the button with user initials
  await header.avatarButton(/SN/).click();

  const menu = header.avatarMenu(/SN/);

  expect(menu.items.elements()).toHaveLength(1);
  await expect.element(menu.logoutButton).toHaveTextContent('Logout');
});

test('should be redirected to /sign-in upon clicking on "Logout"', async () => {
  await server.createSessionMock({
    user: await server.createUserMock({ name: 'Some Name' }),
  });

  await renderWithRouter();
  const { header } = createNavbarPO();

  await header.avatarButton(/SN/).click();
  await header.avatarMenu(/SN/).logoutButton.click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/sign-in'));
});
