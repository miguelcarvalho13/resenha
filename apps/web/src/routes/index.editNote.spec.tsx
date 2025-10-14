import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import {
  getFindAllNotesHandler,
  getSessionHandler,
  postEditNoteHandler,
} from '@/mocks/handlers';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { createNoteForFindAll } from '@/tests/factories/notes';

test('should correctly edit a note', async ({ worker }) => {
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getSessionHandler(),
  );

  const { getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const modal = getByRole('dialog', { name: /Edit note/ });
  const modalElement = modal.element();

  expect(modal.getByLabelText('Content')).toHaveValue('A');

  await modal.getByLabelText('Content').clear();
  await modal.getByLabelText('Content').fill('Updated');
  await modal.getByRole('button', { name: /Save/ }).click();

  // TODO: Find idiomatic way for checking element is not longer visible
  await vi.waitFor(() =>
    expect(document.body.contains(modalElement)).not.toBeTruthy(),
  );
});

test('should require at least 1 char for editing a note', async ({
  worker,
}) => {
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    getSessionHandler(),
  );

  const { getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const modal = getByRole('dialog', { name: /Edit note/ });

  await modal.getByLabelText('Content').clear();
  await modal.getByRole('button', { name: /Save/ }).click();

  expect(modal.getByRole('paragraph')).toHaveTextContent(
    'String must contain at least 1 character(s)',
  );
});
