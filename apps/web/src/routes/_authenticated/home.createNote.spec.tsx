import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly create a note', async () => {
  // create mock server data
  await server.createSessionMock();

  const { getByRole, getByTestId } = await renderWithRouter();

  await getByRole('button', { name: /Create note/ }).click();

  const modal = getByRole('dialog', { name: /Create note/ });
  const modalElement = modal.element();

  await modal.getByLabelText('Content').fill('Lorem Ipsum!');

  const notes = getByTestId('note-card');
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));
  await expect.element(notes.nth(0)).toHaveTextContent('Lorem Ipsum!');
  await getByRole('button', { name: /Close/ }).click();

  // TODO: Find idiomatic way for checking element is not longer visible
  await vi.waitFor(() =>
    expect(document.body.contains(modalElement)).not.toBeTruthy(),
  );
});
