import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import {
  getFindAllNotesHandler,
  postCreateNoteHandler,
  postEditNoteHandler,
} from '@/mocks/routes/notes';
import { getSessionHandler } from '@/mocks/routes/session';
import { createNoteForFindAll } from '@/tests/factories/notes';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly list the notes', async ({ worker }) => {
  (worker as SetupWorker).use(
    getFindAllNotesHandler({
      notes: [
        createNoteForFindAll({ content: 'A' }),
        createNoteForFindAll({ content: 'B' }),
        createNoteForFindAll({ content: 'C' }),
      ],
    }),
    getSessionHandler(),
  );

  const { getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(3),
  );

  const notes = getByTestId('note-card');
  expect(notes.nth(0)).toHaveTextContent('A');
  expect(notes.nth(1)).toHaveTextContent('B');
  expect(notes.nth(2)).toHaveTextContent('C');
});

test('should correctly refresh the list of notes after adding a note', async ({
  worker,
}) => {
  (worker as SetupWorker).use(
    postCreateNoteHandler(),
    getFindAllNotesHandler({ notes: [createNoteForFindAll({ content: 'A' })] }),
    getSessionHandler(),
  );

  const { getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  const notes = getByTestId('note-card');
  expect(notes.nth(0)).toHaveTextContent('A');

  // Create note
  await getByRole('button', { name: /Create note/ }).click();
  const modal = getByRole('dialog', { name: /Create note/ });
  await modal.getByLabelText('Content').fill('Lorem Ipsum!');

  (worker as SetupWorker).use(
    getFindAllNotesHandler({
      notes: [
        createNoteForFindAll({ content: 'A' }),
        createNoteForFindAll({ content: 'B' }),
      ],
    }),
  );

  await modal.getByRole('button', { name: /Save/ }).click();

  // Wait for refreshed list
  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(2),
  );

  expect(notes.nth(0)).toHaveTextContent('A');
  expect(notes.nth(1)).toHaveTextContent('B');
});

test('should correctly refresh the list of notes after editing a note', async ({
  worker,
}) => {
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    postEditNoteHandler(),
    getFindAllNotesHandler({ notes: [note] }),
    getSessionHandler(),
  );

  const { getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  const notes = getByTestId('note-card');
  expect(notes.nth(0)).toHaveTextContent('A');

  // Edit note
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const modal = getByRole('dialog', { name: /Edit note/ });
  await modal.getByLabelText('Content').clear();
  await modal.getByLabelText('Content').fill('B');

  (worker as SetupWorker).use(
    getFindAllNotesHandler({
      notes: [createNoteForFindAll({ ...note, content: 'B' })],
    }),
  );

  await modal.getByRole('button', { name: /Save/ }).click();

  // Wait for refreshed list
  await vi.waitFor(() => expect(notes.nth(0)).toHaveTextContent('B'));
});
