import { http, HttpResponse } from 'msw';
import { type SetupWorker } from 'msw/browser';
import { act } from 'react';
import { expect, vi } from 'vitest';

import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { getSessionHandler } from '@/mocks/handlers';

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

test('should click on "Sign in" and if successful, be redirected to index', async ({
  worker,
}) => {
  (worker as SetupWorker).use(
    http.post(
      '/api/auth/sign-in/email',
      () => new HttpResponse(null, { status: 200 }),
    ),
    getSessionHandler(),
  );

  const { router, getByLabelText, getByRole } = await renderWithRouter();

  await act(() => router.navigate({ to: '/sign-in' }));

  await getByLabelText('Email').fill('some@example.com');
  await getByLabelText('Password').fill('MyPassword123!@');

  await getByRole('button', { name: /Sign in/ }).click();

  await vi.waitFor(() => expect(window.location.pathname).toBe('/'));
});
