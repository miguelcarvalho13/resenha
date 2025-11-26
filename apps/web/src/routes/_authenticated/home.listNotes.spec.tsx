import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNotesPO } from '@/tests/pages/notes';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly list the notes', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });
  await server.createNoteMock({ content: 'B' });
  await server.createNoteMock({ content: 'C' });

  await renderWithRouter();

  const { notes } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(3));

  await expect.element(notes.nth(0)).toHaveTextContent('A');
  await expect.element(notes.nth(1)).toHaveTextContent('B');
  await expect.element(notes.nth(2)).toHaveTextContent('C');
});

test('should correctly refresh the list of notes after adding a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  await renderWithRouter();

  const { notes, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  await expect.element(notes.nth(0)).toHaveTextContent('A');

  // Create note
  await notesPage.createNoteAndCloseModal({ content: 'B' });

  // Wait for refreshed list
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(2));

  await expect.element(notes.nth(0)).toHaveTextContent('A');
  await expect.element(notes.nth(1)).toHaveTextContent('B');
});

test('should correctly refresh the list of notes after editing a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  await renderWithRouter();

  const { notes, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  await expect.element(notes.nth(0)).toHaveTextContent('A');

  // Edit note
  await notesPage.editNoteAndCloseModal({
    noteCard: notes.nth(0),
    content: 'B',
  });

  // Wait for refreshed list
  await expect.element(notes.nth(0)).toHaveTextContent('B');
});
