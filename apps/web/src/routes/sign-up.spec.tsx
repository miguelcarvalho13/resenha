import { http, HttpResponse } from 'msw';
import { type SetupWorker } from 'msw/browser';
import { act } from 'react';
import { expect, vi } from 'vitest';

import { getSessionHandler } from '@/mocks/routes/session';
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

test('should be redirected to index upon clicking on "Sign up"', async ({
  worker,
}) => {
  (worker as SetupWorker).use(
    http.post(
      '/api/auth/sign-up/email',
      () => new HttpResponse(null, { status: 201 }),
    ),
    getSessionHandler(),
  );

  const { router, getByLabelText, getByRole } = await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-up' }));

  await getByLabelText('Name').fill('Some name');
  await getByLabelText('Email').fill('some@example.com');
  await getByLabelText('Password').fill('MyPassword123!@');

  await getByRole('button', { name: /Sign up/ }).click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/'));
});
