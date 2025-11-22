import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly create a note', async () => {
  // create mock server data
  await server.createSessionMock();

  const { getByRole } = await renderWithRouter();

  await getByRole('button', { name: /Create note/ }).click();

  const modal = getByRole('dialog', { name: /Create note/ });
  const modalElement = modal.element();

  await modal.getByLabelText('Content').fill('Lorem Ipsum!');
  await modal.getByRole('button', { name: /Save/ }).click();

  // TODO: Find idiomatic way for checking element is not longer visible
  await vi.waitFor(() =>
    expect(document.body.contains(modalElement)).not.toBeTruthy(),
  );
});

test('should require at least 1 char for creating a note', async () => {
  // create mock server data
  await server.createSessionMock();

  const { getByRole } = await renderWithRouter();

  await getByRole('button', { name: /Create note/ }).click();

  const modal = getByRole('dialog', { name: /Create note/ });

  await modal.getByRole('button', { name: /Save/ }).click();

  expect(modal.getByRole('paragraph')).toHaveTextContent(
    'String must contain at least 1 character(s)',
  );
});
