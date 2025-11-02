import { act } from 'react';
import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should render sign up form fields', async () => {
  const { router, getByLabelText, getByRole, getByText } =
    await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-up' }));

  await expect.element(getByLabelText('Name')).toBeInTheDocument();
  await expect.element(getByLabelText('Email')).toBeInTheDocument();
  await expect.element(getByLabelText('Password')).toBeInTheDocument();
  await expect
    .element(getByRole('button', { name: /Sign up/ }))
    .toBeInTheDocument();

  const helperText = getByText('Already registered? Sign in');

  await expect.element(helperText).toBeInTheDocument();
  await expect
    .element(helperText.getByRole('link', { name: /Sign in/ }))
    .toHaveAttribute('href', '/sign-in');
});

test('should be redirected to index upon clicking on "Sign up"', async () => {
  const { router, getByLabelText, getByRole } = await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-up' }));

  await getByLabelText('Name').fill('Some name');
  await getByLabelText('Email').fill('some@example.com');
  await getByLabelText('Password').fill('MyPassword123!@');

  // creates a session in the mock server
  await server.createSessionMock();

  await getByRole('button', { name: /Sign up/ }).click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/'));
});
