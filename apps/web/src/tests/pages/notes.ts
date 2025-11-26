import { page, type Locator } from '@vitest/browser/context';
import { expect } from 'vitest';

export const createNotesPO = () => {
  const notes = page.getByTestId('note-card');
  const createNoteButton = page.getByRole('button', { name: /Create note/ });

  const modal = page.getByRole('dialog', { name: /(Create|Edit) note/ });

  const noteModal = {
    closeButton: modal.getByRole('button', { name: /Close/ }),
    fields: {
      content: modal.getByLabelText('Content'),
    },
    dialog: modal,

    // methods
    expectToBeVisible: () => expect.element(modal).toBeVisible(),
    expectNotToBeVisible: () => expect.element(modal).not.toBeInTheDocument(),
  };

  const createNote = async ({ content }: { content: string }) => {
    await createNoteButton.click();
    await noteModal.expectToBeVisible();
    await noteModal.fields.content.fill(content);
  };

  const createNoteAndCloseModal = async ({ content }: { content: string }) => {
    await createNote({ content });
    await noteModal.closeButton.click();
  };

  const noteEditButton = (noteCard: Locator) =>
    noteCard.getByRole('button', { name: /Edit note/ });

  const editNote = async ({
    noteCard,
    content,
  }: {
    noteCard: Locator;
    content: string;
  }) => {
    await noteEditButton(noteCard).click();
    await noteModal.expectToBeVisible();
    await noteModal.fields.content.clear();
    await noteModal.fields.content.fill(content);
  };

  const editNoteAndCloseModal = async ({
    noteCard,
    content,
  }: {
    noteCard: Locator;
    content: string;
  }) => {
    await editNote({ noteCard, content });
    await noteModal.closeButton.click();
  };

  return {
    createNoteButton,
    notes,
    noteModal,

    // methods
    createNote,
    createNoteAndCloseModal,
    editNote,
    editNoteAndCloseModal,
    noteEditButton,
  };
};
