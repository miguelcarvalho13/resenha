import { expect, vi } from 'vitest';

import { createNoteMock } from '@/tests/factories/notes';
import { createSessionMock } from '@/tests/factories/session';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly list the notes', async () => {
  // create mock server data
  await createSessionMock();
  await createNoteMock({ content: 'A' });
  await createNoteMock({ content: 'B' });
  await createNoteMock({ content: 'C' });

  const { getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(3),
  );

  const notes = getByTestId('note-card');
  expect(notes.nth(0)).toHaveTextContent('A');
  expect(notes.nth(1)).toHaveTextContent('B');
  expect(notes.nth(2)).toHaveTextContent('C');
});

test('should correctly refresh the list of notes after adding a note', async () => {
  // create mock server data
  await createSessionMock();
  await createNoteMock({ content: 'A' });

  const { getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  const notes = getByTestId('note-card');
  expect(notes.nth(0)).toHaveTextContent('A');

  // Create note
  await getByRole('button', { name: /Create note/ }).click();
  const modal = getByRole('dialog', { name: /Create note/ });
  await modal.getByLabelText('Content').fill('B');
  await modal.getByRole('button', { name: /Save/ }).click();

  // Wait for refreshed list
  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(2),
  );

  expect(notes.nth(0)).toHaveTextContent('A');
  expect(notes.nth(1)).toHaveTextContent('B');
});

test('should correctly refresh the list of notes after editing a note', async () => {
  // create mock server data
  await createSessionMock();
  await createNoteMock({ content: 'A' });

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
  await modal.getByRole('button', { name: /Save/ }).click();

  // Wait for refreshed list
  await vi.waitFor(() => expect(notes.nth(0)).toHaveTextContent('B'));
});
