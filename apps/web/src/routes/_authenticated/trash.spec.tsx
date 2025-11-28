import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNavbarPO } from '@/tests/pages/navbar';
import { createNotesPO } from '@/tests/pages/notes';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should be possible to hard delete a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });
  await server.createNoteMock({ content: 'B', deletedAt: new Date() });
  await server.createNoteMock({ content: 'C' });

  await renderWithRouter();
  const { notes, noteDeleteButton, hardDeleteModal } = createNotesPO();
  const { header, navbarHomeLink, navbarTrashLink } = createNavbarPO();

  // navigate to trash
  await header.hamburgerMenu.click();
  await navbarTrashLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Hard deletes the note
  await noteDeleteButton(notes.nth(0)).click();

  // Assert confirmation modal
  await hardDeleteModal.expectToBeVisible();
  await expect
    .element(hardDeleteModal.title)
    .toHaveTextContent('Delete note permanently?');
  await hardDeleteModal.confirmButton.click();
  await hardDeleteModal.expectNotToBeVisible();

  // The grid should now be empty
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(0));

  // Navigating to home page we should see only not deleted notes there
  await header.hamburgerMenu.click();
  await navbarHomeLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(2));
  await expect.element(notes.nth(0)).toHaveTextContent('A');
  await expect.element(notes.nth(1)).toHaveTextContent('C');
});
