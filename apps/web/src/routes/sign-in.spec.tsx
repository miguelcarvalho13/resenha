import { act } from 'react';
import { expect, vi } from 'vitest';

import { createSessionMock } from '@/tests/factories/session';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should render sign in form fields', async () => {
  const { router, getByLabelText, getByRole, getByText } =
    await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-in' }));

  await expect.element(getByLabelText('Name')).not.toBeInTheDocument();
  await expect.element(getByLabelText('Email')).toBeInTheDocument();
  await expect.element(getByLabelText('Password')).toBeInTheDocument();
  await expect
    .element(getByRole('button', { name: /Sign in/ }))
    .toBeInTheDocument();

  const helperText = getByText('Not registered yet? Sign up');

  await expect.element(helperText).toBeInTheDocument();
  await expect
    .element(helperText.getByRole('link', { name: /Sign up/ }))
    .toHaveAttribute('href', '/sign-up');
});

test('should be redirected to index upon clicking on "Sign in"', async () => {
  const { router, getByLabelText, getByRole } = await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-in' }));

  await getByLabelText('Email').fill('some@example.com');
  await getByLabelText('Password').fill('MyPassword123!@');

  // creates a session in the mock server
  await createSessionMock();

  await getByRole('button', { name: /Sign in/ }).click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/'));
});
