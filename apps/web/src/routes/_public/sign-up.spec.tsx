import { act } from 'react';
import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should render sign up form fields', async () => {
  await server.createGlobalConfigMock({ isInviteCodesEnabled: false });

  const { router, getByLabelText, getByRole, getByText } =
    await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-up' }));

  await expect.element(getByLabelText('Name')).toBeVisible();
  await expect.element(getByLabelText('Email')).toBeVisible();
  await expect.element(getByLabelText('Password')).toBeVisible();
  await expect.element(getByRole('button', { name: /Sign up/ })).toBeVisible();

  // if invite codes are not enabled, then invite code field should not be present
  await expect.element(getByLabelText('Invite code')).not.toBeInTheDocument();

  const helperText = getByText('Already registered? Sign in');

  await expect.element(helperText).toBeInTheDocument();
  await expect
    .element(helperText.getByRole('link', { name: /Sign in/ }))
    .toHaveAttribute('href', '/sign-in');
});

test('should be redirected to /home upon clicking on "Sign up"', async () => {
  const { router, getByLabelText, getByRole } = await renderWithRouter();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/sign-in'));
  await act(() => router.navigate({ to: '/sign-up' }));

  await getByLabelText('Name').fill('Some name');
  await getByLabelText('Email').fill('some@example.com');
  await getByLabelText('Password').fill('MyPassword123!@');

  // creates a session in the mock server
  await server.createSessionMock();

  await getByRole('button', { name: /Sign up/ }).click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/home'));
});

test('should not render components not meant for logged out users', async () => {
  const { router, getByRole } = await renderWithRouter();
  await act(() => router.navigate({ to: '/sign-in' }));

  await expect.element(getByRole('navigation')).not.toBeInTheDocument();
  await expect
    .element(getByRole('button', { name: /Search notes/ }))
    .not.toBeInTheDocument();
});

test('should render "Invite code" field if invite codes are configured', async () => {
  await server.createGlobalConfigMock({ isInviteCodesEnabled: true });

  const { router, getByLabelText, getByRole } = await renderWithRouter();
  await act(() => router.navigate({ to: '/sign-up' }));

  await expect.element(getByLabelText('Name')).toBeVisible();
  await expect.element(getByLabelText('Email')).toBeVisible();
  await expect.element(getByLabelText('Password')).toBeVisible();
  await expect.element(getByLabelText('Invite code')).toBeVisible();
  await expect.element(getByRole('button', { name: /Sign up/ })).toBeVisible();
});

test('if enabled, invite codes should be required', async () => {
  await server.createGlobalConfigMock({ isInviteCodesEnabled: true });

  const { router, getByLabelText, getByRole, getByText } =
    await renderWithRouter();
  await act(() => router.navigate({ to: '/sign-up' }));

  await getByLabelText('Name').fill('Some name');
  await getByLabelText('Email').fill('some@example.com');
  await getByLabelText('Password').fill('MyPassword123!@');

  await getByRole('button', { name: /Sign up/ }).click();

  // Should show error text if not filled
  await expect.element(getByText('Invite code is required')).toBeVisible();
});
