import { userEvent } from '@vitest/browser/context';
import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNotesPO } from '@/tests/pages/notes';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly edit a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open edit modal
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();
  await expect.element(noteModal.fields.content).toHaveValue('A');
  await noteModal.fields.content.clear();
  await noteModal.fields.content.fill('Updated');
  await noteModal.closeButton.click();

  await noteModal.expectNotToBeVisible();
});

test('should update modal content when reopening the modal after a save', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.editNoteAndCloseModal({
    noteCard: notes.nth(0),
    content: 'B',
  });

  // Reopen the modal
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();
  await expect.element(noteModal.fields.content).toHaveValue('B');
});

test('should be able to list tags in a note', async () => {
  // create mock server data
  await server.createSessionMock();
  const note = await server.createNoteMock({ content: 'A' });
  await server.createNoteTagMock({
    name: 'abc',
    value: 'abc',
    type: 'string',
    note,
  });
  await server.createNoteTagMock({
    name: 'score',
    value: 10.5,
    type: 'number',
    note,
  });
  await server.createNoteTagMock({
    name: 'created',
    value: '2025-10-27',
    type: 'date',
    note,
  });
  await server.createNoteTagMock({
    name: 'active',
    value: true,
    type: 'boolean',
    note,
  });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(4));

  expect(tags.elements()).toHaveLength(4);
  await expect.element(tags.nth(0)).toHaveTextContent('abc');
  await expect.element(tags.nth(1)).toHaveTextContent('score: 10.5');
  await expect.element(tags.nth(2)).toHaveTextContent('created: 2025-10-27');
  await expect.element(tags.nth(3)).toHaveTextContent('active: yes');
});

test('should list all kinds of tags that are possible to add tags in a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const { getByLabelText, getByRole } = await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();

  // Initially no tags should be shown
  const addTagMenu = getByRole('listbox', { name: 'List of tags' });
  const addTagMenuItems = addTagMenu.getByRole('option');
  expect(addTagMenuItems.elements()).toHaveLength(0);

  await getByLabelText('Search tags').fill('abc');

  // After typing something, at least the creatable tags should be shown
  expect(addTagMenuItems.elements()).toHaveLength(4);
  await expect.element(addTagMenuItems.nth(0)).toHaveTextContent('abc');
  await expect.element(addTagMenuItems.nth(1)).toHaveTextContent('abc: number');
  await expect.element(addTagMenuItems.nth(2)).toHaveTextContent('abc: date');
  await expect.element(addTagMenuItems.nth(3)).toHaveTextContent('abc: yes/no');
});

test(`should only list new tags if there's no tag with the same name already in the system`, async () => {
  // create mock server data
  await server.createSessionMock();
  const note = await server.createNoteMock({ content: 'A' });
  await server.createTagMock({ name: 'string tag', type: 'string' });
  await server.createTagMock({ name: 'number tag', type: 'number' });
  await server.createTagMock({ name: 'date tag', type: 'date' });
  await server.createTagMock({ name: 'boolean tag', type: 'boolean' });

  // setup used tags, to assert those won't be shown in the combobox
  const tag1 = await server.createTagMock({
    name: 'string tag 2',
    type: 'string',
  });
  const tag2 = await server.createTagMock({
    name: 'number tag 2',
    type: 'number',
  });
  const tag3 = await server.createTagMock({ name: 'date tag 2', type: 'date' });
  const tag4 = await server.createTagMock({
    name: 'boolean tag 2',
    type: 'boolean',
  });
  await server.createNoteTagMock({
    note,
    tag: tag1,
    type: tag1.type,
    name: tag1.name,
    value: '123',
  });
  await server.createNoteTagMock({
    note,
    tag: tag2,
    type: tag2.type,
    name: tag2.name,
    value: 10,
  });
  await server.createNoteTagMock({
    note,
    tag: tag3,
    type: tag3.type,
    name: tag3.name,
    value: '2025-11-04',
  });
  await server.createNoteTagMock({
    note,
    tag: tag4,
    type: tag4.type,
    name: tag4.name,
    value: false,
  });

  const { getByLabelText, getByRole } = await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();

  // Initially all tags in the system should be shown
  const addTagMenu = getByRole('listbox', { name: 'List of tags' });
  const addTagMenuItems = addTagMenu.getByRole('option');
  await vi.waitFor(() => expect(addTagMenuItems.elements()).toHaveLength(4));
  await expect
    .element(addTagMenuItems.nth(0))
    .toHaveTextContent('boolean tag: yes/no');
  await expect
    .element(addTagMenuItems.nth(1))
    .toHaveTextContent('date tag: date');
  await expect
    .element(addTagMenuItems.nth(2))
    .toHaveTextContent('number tag: number');
  await expect.element(addTagMenuItems.nth(3)).toHaveTextContent('string tag');

  await getByLabelText('Search tags').fill('string');

  // After typing something, only filtered tags should be shown
  expect(addTagMenuItems.elements()).toHaveLength(1);
  await expect.element(addTagMenuItems.nth(0)).toHaveTextContent('string tag');

  await getByLabelText('Search tags').fill('strings');

  // After searching for something not in the list, only new tags suggestion should be shown
  expect(addTagMenuItems.elements()).toHaveLength(4);
  await expect.element(addTagMenuItems.nth(0)).toHaveTextContent('strings');
  await expect
    .element(addTagMenuItems.nth(1))
    .toHaveTextContent('strings: number');
  await expect
    .element(addTagMenuItems.nth(2))
    .toHaveTextContent('strings: date');
  await expect
    .element(addTagMenuItems.nth(3))
    .toHaveTextContent('strings: yes/no');
});

test('should be able to add tags in a note [string]', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'string-tag';

  const { getByLabelText, getByRole } = await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}$`))
    .click();
  await expect.element(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  await expect.element(tags.nth(0)).toHaveTextContent(name);
});

test('should be able to add tags in a note [number]', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'number-tag';

  const { getByLabelText, getByRole } = await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: number`))
    .click();
  await expect.element(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  await expect.element(tags.nth(0)).toHaveTextContent(`${name}: 10`);
});

test('should be able to add tags in a note [date]', async () => {
  vi.setSystemTime(new Date(2025, 9, 30));

  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'date-tag';

  const { getByLabelText, getByRole } = await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: date`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(`${name}: 2025-10-30`);
  vi.useRealTimers();
});

test('should be able to add tags in a note [boolean]', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'boolean-tag';

  const { getByLabelText, getByRole } = await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');

  const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

  await addTagButton.click();
  await getByLabelText('Search tags').fill(name);
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: yes/no`))
    .click();
  await expect.element(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  await expect.element(tags.nth(0)).toHaveTextContent(`${name}: yes`);
});

test.each([
  { name: 'abc', value: '', type: 'string' },
  { name: 'abc', value: ': 10', type: 'number' },
  { name: 'abc', value: ': 2025-10-01', type: 'date' },
  { name: 'abc', value: ': yes', type: 'boolean' },
] as const)(
  'should be able to add existing tags in a note [$type]',
  async ({ name, value, type }) => {
    vi.setSystemTime(new Date(2025, 9, 1));

    // create mock server data
    await server.createSessionMock();
    await server.createNoteMock({ content: 'A' });
    await server.createTagMock({ name, type });

    const { getByLabelText, getByRole } = await renderWithRouter();

    const { notes, noteModal, ...notesPage } = createNotesPO();

    await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

    // Open the modal for the first time and edit it
    await notesPage.noteEditButton(notes.nth(0)).click();
    await noteModal.expectToBeVisible();

    const tagsContainer = noteModal.dialog.getByTestId('tags-container');

    const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

    await addTagButton.click();

    // Initially all tags in the system should be shown
    const addTagMenu = getByRole('listbox', { name: 'List of tags' });
    const addTagMenuItems = addTagMenu.getByRole('option');
    await getByLabelText('Search tags').fill(name);
    await vi.waitFor(() => expect(addTagMenuItems.elements()).toHaveLength(1));
    await addTagMenuItems.nth(0).click();

    // After selecting the existing tag, a note tag should be visible in the note, with default values
    await expect.element(addTagButton).toBeDisabled();
    const tags = tagsContainer.getByTestId('tag');
    await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
    await expect.element(tags.nth(0)).toHaveTextContent(`${name}${value}`);

    vi.useRealTimers();
  },
);

test('should be able to edit tags in a note [string]', async () => {
  // create mock server data
  await server.createSessionMock();
  const note = await server.createNoteMock({ content: 'A' });
  const currentTagName = 'string-tag';
  await server.createNoteTagMock({
    name: currentTagName,
    value: currentTagName,
    type: 'string',
    note,
  });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));

  // clicks in the tag to activate edit mode
  const tag = tags.nth(0);
  const tagEditButton = tag.getByRole('button', {
    name: new RegExp(`Edit ${currentTagName}`),
  });
  await tagEditButton.click();

  const tagInput = tagsContainer.getByLabelText(
    new RegExp(`Edit ${currentTagName} value`),
  );

  await expect.element(tagInput).toHaveValue(currentTagName);
  await expect.element(tagInput.element()).toHaveFocus();
  await tagInput.clear();
  await tagInput.fill('new-tag-name');

  // after focus out, the input should no longer be in the document and the tag name to be updated
  await userEvent.tab();
  await expect.element(tagInput).not.toBeInTheDocument();
  await expect.element(tagEditButton).toBeDisabled();
  await vi.waitFor(() => expect(tags.nth(0)).toHaveTextContent('new-tag-name'));
  await expect
    .element(tag.getByRole('button', { name: /Edit new-tag-name/ }))
    .toBeEnabled();
});

test('should be able to edit tags in a note [number]', async () => {
  // create mock server data
  await server.createSessionMock();
  const note = await server.createNoteMock({ content: 'A' });
  const currentTagName = 'number-tag';
  await server.createNoteTagMock({
    name: currentTagName,
    value: 10,
    type: 'number',
    note,
  });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));

  // clicks in the tag to activate edit mode
  const tag = tags.nth(0);
  const tagEditButton = tag.getByRole('button', {
    name: new RegExp(`Edit ${currentTagName}`),
  });
  await tagEditButton.click();

  const tagInput = tagsContainer.getByLabelText(
    new RegExp(`Edit ${currentTagName} value`),
  );

  await expect.element(tagInput).toHaveValue('10');
  await expect.element(tagInput.element()).toHaveFocus();
  await tagInput.clear();
  await tagInput.fill('15.5');

  // after focus out, the input should no longer be in the document and the tag name to be updated
  await userEvent.tab();
  await expect.element(tagInput).not.toBeInTheDocument();
  await expect.element(tagEditButton).toBeDisabled();
  await vi.waitFor(() =>
    expect(tags.nth(0)).toHaveTextContent('number-tag: 15.5'),
  );
  await expect.element(tagEditButton).toBeEnabled();
});

test('should be able to edit tags in a note [date]', async () => {
  // create mock server data
  await server.createSessionMock();
  const note = await server.createNoteMock({ content: 'A' });
  const currentTagName = 'date-tag';
  await server.createNoteTagMock({
    name: currentTagName,
    value: '2025-10-31',
    type: 'date',
    note,
  });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));

  // clicks in the tag to activate edit mode
  const tag = tags.nth(0);
  const tagEditButton = tag.getByRole('button', {
    name: new RegExp(`Edit ${currentTagName}`),
  });
  await tagEditButton.click();

  const tagInput = tagsContainer.getByLabelText(
    new RegExp(`Edit ${currentTagName} value`),
  );

  await expect.element(tagInput).toHaveValue('2025-10-31');
  await expect.element(tagInput.element()).toHaveFocus();
  await tagInput.clear();
  await tagInput.fill('2025-11-01');

  // after focus out, the input should no longer be in the document and the tag name to be updated
  await userEvent.tab();
  await expect.element(tagInput).not.toBeInTheDocument();
  await expect.element(tagEditButton).toBeDisabled();
  await vi.waitFor(() =>
    expect(tags.nth(0)).toHaveTextContent('date-tag: 2025-11-01'),
  );
  await expect.element(tagEditButton).toBeEnabled();
});

test('should be able to edit tags in a note [boolean]', async () => {
  // create mock server data
  await server.createSessionMock();
  const note = await server.createNoteMock({ content: 'A' });
  const currentTagName = 'boolean-tag';
  await server.createNoteTagMock({
    name: currentTagName,
    value: true,
    type: 'boolean',
    note,
  });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const tagsContainer = noteModal.dialog.getByTestId('tags-container');
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));

  // clicks in the tag to activate edit mode
  const tag = tags.nth(0);
  const tagEditButton = tag.getByRole('button', {
    name: new RegExp(`Edit ${currentTagName}`),
  });
  await tagEditButton.click();

  const tagInput = tagsContainer.getByLabelText(
    new RegExp(`Edit ${currentTagName} value`),
  );

  await expect.element(tagInput).toHaveValue('YES');
  await expect.element(tagInput.element()).toHaveFocus();
  await tagInput.selectOptions(tagInput.getByRole('option', { name: /NO/ }));

  // after focus out, the input should no longer be in the document and the tag name to be updated
  await userEvent.tab();
  await expect.element(tagInput).not.toBeInTheDocument();
  await expect.element(tagEditButton).toBeDisabled();
  await vi.waitFor(() =>
    expect(tags.nth(0)).toHaveTextContent('boolean-tag: no'),
  );
  await expect.element(tagEditButton).toBeEnabled();
});

test.each([
  { name: 'abc', value: 'abc', type: 'string' },
  { name: 'abc', value: 10, type: 'number' },
  { name: 'abc', value: '2025-10-01', type: 'date' },
  { name: 'abc', value: false, type: 'boolean' },
] as const)(
  'should be able to delete tags in a note [$type]',
  async ({ name, value, type }) => {
    // create mock server data
    await server.createSessionMock();
    const note = await server.createNoteMock({ content: 'A' });
    await server.createNoteTagMock({ name, value, type, note });

    await renderWithRouter();

    const { notes, noteModal, ...notesPage } = createNotesPO();

    await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

    // Open the modal for the first time and edit it
    await notesPage.noteEditButton(notes.nth(0)).click();
    await noteModal.expectToBeVisible();

    const tagsContainer = noteModal.dialog.getByTestId('tags-container');
    const tags = tagsContainer.getByTestId('tag');

    await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));

    // clicks in the tag delete button
    server.timing = 100;
    const tag = tags.nth(0);
    const tagDeleteButton = tag.getByRole('button', {
      name: new RegExp(`Remove ${name}`),
    });
    const tagEditButton = tag.getByRole('button', {
      name: new RegExp(`Edit ${name}`),
    });
    await tagDeleteButton.click();

    // While deleting, both edit and delete buttons should be disabled
    await expect.element(tagDeleteButton).toBeDisabled();
    await expect.element(tagEditButton).toBeDisabled();

    // after deletion, the tag should no longer exist
    await expect.element(tag).not.toBeInTheDocument();
  },
);

test('should render "created" and "updated" fixed/default tags', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({
    content: 'A',
    createdAt: new Date(2025, 10, 20),
    updatedAt: new Date(2025, 10, 22),
  });

  await renderWithRouter();

  const { notes, noteModal, ...notesPage } = createNotesPO();

  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await notesPage.noteEditButton(notes.nth(0)).click();
  await noteModal.expectToBeVisible();

  const fixedTagsContainer = noteModal.dialog.getByTestId(
    'fixed-tags-container',
  );

  const tags = fixedTagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(2));

  // clicks in the tag to activate edit mode
  await expect.element(tags.nth(0)).toHaveTextContent('created: 2025-11-20');
  await expect.element(tags.nth(1)).toHaveTextContent('updated: 2025-11-22');
});
