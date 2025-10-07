import { http, HttpResponse } from 'msw';
import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import { getSessionHandler } from '@/mocks/handlers';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly create a note', async ({ worker }) => {
  (worker as SetupWorker).use(
    http.post('/api/trpc/notes.createNote', () =>
      HttpResponse.json([{ result: { data: { json: {} } } }]),
    ),
    getSessionHandler(),
  );

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

test('should require at least 1 char for creating a note', async ({
  worker,
}) => {
  (worker as SetupWorker).use(getSessionHandler());

  const { getByRole } = await renderWithRouter();

  await getByRole('button', { name: /Create note/ }).click();

  const modal = getByRole('dialog', { name: /Create note/ });

  await modal.getByRole('button', { name: /Save/ }).click();

  expect(modal.getByRole('paragraph')).toHaveTextContent(
    'String must contain at least 1 character(s)',
  );
});
