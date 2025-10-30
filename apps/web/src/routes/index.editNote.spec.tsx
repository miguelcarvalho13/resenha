import { type SetupWorker } from 'msw/browser';
import { expect, vi } from 'vitest';

import {
  getFindAllNotesHandler,
  getFindAllNoteTagsHandler,
  getSessionHandler,
  postCreateNoteTagHandler,
  postEditNoteHandler,
} from '@/mocks/handlers';
import { createNoteForFindAll } from '@/tests/factories/notes';
import { createNoteTag } from '@/tests/factories/tags';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

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

test('should update modal content when reopening the modal after a save', async ({
  worker,
}) => {
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

  // Open the modal for the first time and edit it
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

  // Waits the modal to close
  const modalElement = modal.element();
  await vi.waitFor(() =>
    expect(document.body.contains(modalElement)).not.toBeTruthy(),
  );

  // Reopen the modal
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  expect(
    getByRole('dialog', { name: /Edit note/ }).getByLabelText('Content'),
  ).toHaveValue('B');
});

test('should be able to list tags in a note', async ({ worker }) => {
  const note = createNoteForFindAll({ content: 'A', id: '123' });
  const noteTags = [
    createNoteTag({ name: 'abc', value: 'abc', type: 'string' }),
    createNoteTag({ name: 'score', value: 10.5, type: 'number' }),
    createNoteTag({ name: 'created', value: '2025-10-27', type: 'date' }),
    createNoteTag({ name: 'active', value: true, type: 'boolean' }),
  ];

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getFindAllNoteTagsHandler({ noteTags }),
    getSessionHandler(),
  );

  const { getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  // Open the modal for the first time and edit it
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const tagsContainer = getByRole('dialog', { name: /Edit note/ }).getByTestId(
    'tags-container',
  );
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(4));

  expect(tags.elements()).toHaveLength(4);
  expect(tags.nth(0)).toHaveTextContent('abc');
  expect(tags.nth(1)).toHaveTextContent('score: 10.5');
  expect(tags.nth(2)).toHaveTextContent('created: 2025-10-27');
  expect(tags.nth(3)).toHaveTextContent('active: yes');
});

test('should list all kinds of tags that are possible to add tags in a note', async ({
  worker,
}) => {
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getFindAllNoteTagsHandler(),
    getSessionHandler(),
  );

  const { getByLabelText, getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  // Open the modal for the first time and edit it
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const tagsContainer = getByRole('dialog', { name: /Edit note/ }).getByTestId(
    'tags-container',
  );

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();

  // Initially no tags should be shown
  const addTagMenu = getByRole('listbox', { name: 'List of tags' });
  const addTagMenuItems = addTagMenu.getByRole('option');
  expect(addTagMenuItems.elements()).toHaveLength(0);

  await getByLabelText('Search tags').fill('abc');

  // After typing something, at least the creatable tags should be shown
  expect(addTagMenuItems.elements()).toHaveLength(4);
  expect(addTagMenuItems.nth(0)).toHaveTextContent('abc');
  expect(addTagMenuItems.nth(1)).toHaveTextContent('abc: number');
  expect(addTagMenuItems.nth(2)).toHaveTextContent('abc: date');
  expect(addTagMenuItems.nth(3)).toHaveTextContent('abc: yes/no');
});

test('should be able to add tags in a note [string]', async ({ worker }) => {
  const name = 'string-tag';
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getFindAllNoteTagsHandler(),
    postCreateNoteTagHandler({ wait: 200 }),
    getSessionHandler(),
  );

  const { getByLabelText, getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  // Open the modal for the first time and edit it
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const tagsContainer = getByRole('dialog', { name: /Edit note/ }).getByTestId(
    'tags-container',
  );

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);

  (worker as SetupWorker).use(
    getFindAllNoteTagsHandler({
      noteTags: [createNoteTag({ name, type: 'string' })],
    }),
  );

  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}$`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(name);
});

test('should be able to add tags in a note [number]', async ({ worker }) => {
  const name = 'number-tag';
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getFindAllNoteTagsHandler(),
    postCreateNoteTagHandler({ wait: 200 }),
    getSessionHandler(),
  );

  const { getByLabelText, getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  // Open the modal for the first time and edit it
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const tagsContainer = getByRole('dialog', { name: /Edit note/ }).getByTestId(
    'tags-container',
  );

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);

  (worker as SetupWorker).use(
    getFindAllNoteTagsHandler({
      noteTags: [createNoteTag({ name, type: 'number', value: 10 })],
    }),
  );

  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: number`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(`${name}: 10`);
});

test('should be able to add tags in a note [date]', async ({ worker }) => {
  const name = 'date-tag';
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getFindAllNoteTagsHandler(),
    postCreateNoteTagHandler({ wait: 200 }),
    getSessionHandler(),
  );

  const { getByLabelText, getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  // Open the modal for the first time and edit it
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const tagsContainer = getByRole('dialog', { name: /Edit note/ }).getByTestId(
    'tags-container',
  );

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);

  (worker as SetupWorker).use(
    getFindAllNoteTagsHandler({
      noteTags: [createNoteTag({ name, type: 'date', value: '2025-10-30' })],
    }),
  );

  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: date`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(`${name}: 2025-10-30`);
});

test('should be able to add tags in a note [boolean]', async ({ worker }) => {
  const name = 'boolean-tag';
  const note = createNoteForFindAll({ content: 'A', id: '123' });

  (worker as SetupWorker).use(
    getFindAllNotesHandler({ notes: [note] }),
    postEditNoteHandler(),
    getFindAllNoteTagsHandler(),
    postCreateNoteTagHandler({ wait: 200 }),
    getSessionHandler(),
  );

  const { getByLabelText, getByRole, getByTestId } = await renderWithRouter();

  await vi.waitFor(() =>
    expect(getByTestId('note-card').elements()).toHaveLength(1),
  );

  // Open the modal for the first time and edit it
  await getByTestId('note-card')
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const tagsContainer = getByRole('dialog', { name: /Edit note/ }).getByTestId(
    'tags-container',
  );

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);

  (worker as SetupWorker).use(
    getFindAllNoteTagsHandler({
      noteTags: [createNoteTag({ name, type: 'boolean', value: true })],
    }),
  );

  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: yes/no`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(`${name}: yes`);
});
