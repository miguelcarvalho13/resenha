import { renderWithRouter } from '@/tests/setup';
import { act } from 'react';
import { expect, test } from 'vitest';

test('renders sign up form fields', async () => {
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
