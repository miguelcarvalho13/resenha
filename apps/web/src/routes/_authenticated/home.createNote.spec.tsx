import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNotesPO } from '@/tests/pages/notes';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly create a note', async () => {
  // create mock server data
  await server.createSessionMock();

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await notesPage.createNoteButton.click();
  await noteModal.expectToBeVisible();

  await noteModal.fields.content.fill('Lorem Ipsum!');

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));
  await expect.element(notes.nth(0)).toHaveTextContent('Lorem Ipsum!');
  await noteModal.closeButton.click();

  await noteModal.expectNotToBeVisible();
});
