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

test('should be possible to undo soft deletion on a note', async () => {
  vi.setSystemTime(new Date(2025, 9, 30));

  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });
  await server.createNoteMock({ content: 'B', deletedAt: new Date() });
  await server.createNoteMock({ content: 'C' });

  await renderWithRouter();
  const { notes, noteEditButton, noteModal } = createNotesPO();
  const { header, navbarHomeLink, navbarTrashLink } = createNavbarPO();
  const { fixedTagsContainer } = noteModal;

  // navigate to trash
  await header.hamburgerMenu.click();
  await navbarTrashLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Hard deletes the note
  await noteEditButton(notes.nth(0)).click();

  // Assert confirmation modal
  await noteModal.expectToBeVisible();

  // Assert system tags
  const fixedTags = noteModal.fixedTagsContainer.tags;
  expect(fixedTags.elements()).toHaveLength(3);
  await expect.element(fixedTags.nth(0)).toHaveTextContent(/created/);
  await expect.element(fixedTags.nth(1)).toHaveTextContent(/updated/);
  await expect
    .element(fixedTags.nth(2))
    .toHaveTextContent(/deleted: 2025-10-30/);

  // Only deleted tag should have remove button
  await expect
    .element(fixedTagsContainer.removeTagButton(fixedTags.nth(0), 'created'))
    .not.toBeInTheDocument();
  await expect
    .element(fixedTagsContainer.removeTagButton(fixedTags.nth(1), 'updated'))
    .not.toBeInTheDocument();
  await expect
    .element(fixedTagsContainer.removeTagButton(fixedTags.nth(2), 'deleted'))
    .toBeVisible();

  // Remove deleted tag
  await fixedTagsContainer.removeTagButton(fixedTags.nth(2), 'deleted').click();
  await expect.element(fixedTags.nth(2)).not.toBeInTheDocument();
  await noteModal.closeButton.click();
  await noteModal.expectNotToBeVisible();

  // The grid should now be empty
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(0));

  // Navigating to home page we should see only not deleted notes there
  await header.hamburgerMenu.click();
  await navbarHomeLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(3));
  await expect.element(notes.nth(0)).toHaveTextContent('A');
  await expect.element(notes.nth(1)).toHaveTextContent('B');
  await expect.element(notes.nth(2)).toHaveTextContent('C');
  vi.useRealTimers();
});
