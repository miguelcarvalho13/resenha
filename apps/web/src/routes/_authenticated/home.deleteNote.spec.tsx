import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNotesPO } from '@/tests/pages/notes';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { createNavbarPO } from '@/tests/pages/navbar';

test('should be possible to delete a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });
  await server.createNoteMock({ content: 'B' });
  await server.createNoteMock({ content: 'C' });

  await renderWithRouter();
  const { notes, noteDeleteButton, softDeleteModal } = createNotesPO();
  const { header, navbarTrashLink } = createNavbarPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(3));

  // Soft deletes the note
  await noteDeleteButton(notes.nth(1)).click();

  // Assert confirmation modal
  await softDeleteModal.expectToBeVisible();
  await expect
    .element(softDeleteModal.title)
    .toHaveTextContent('Send note to trash?');
  await softDeleteModal.confirmButton.click();
  await softDeleteModal.expectNotToBeVisible();

  // The grid should now have only two notes
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(2));
  await expect.element(notes.nth(0)).toHaveTextContent('A');
  await expect.element(notes.nth(1)).toHaveTextContent('C');

  // Navigating to trash page we should see only one note there
  await header.hamburgerMenu.click();
  await navbarTrashLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));
  await expect.element(notes.nth(0)).toHaveTextContent('B');
});
