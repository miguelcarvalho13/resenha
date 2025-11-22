import { userEvent } from '@vitest/browser/context';
import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should correctly edit a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

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

test('should require at least 1 char for editing a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

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

test('should update modal content when reopening the modal after a save', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

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

test('should list all kinds of tags that are possible to add tags in a note', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

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

  // Initially all tags in the system should be shown
  const addTagMenu = getByRole('listbox', { name: 'List of tags' });
  const addTagMenuItems = addTagMenu.getByRole('option');
  await vi.waitFor(() => expect(addTagMenuItems.elements()).toHaveLength(4));
  expect(addTagMenuItems.nth(0)).toHaveTextContent('boolean tag: yes/no');
  expect(addTagMenuItems.nth(1)).toHaveTextContent('date tag: date');
  expect(addTagMenuItems.nth(2)).toHaveTextContent('number tag: number');
  expect(addTagMenuItems.nth(3)).toHaveTextContent('string tag');

  await getByLabelText('Search tags').fill('string');

  // After typing something, only filtered tags should be shown
  expect(addTagMenuItems.elements()).toHaveLength(1);
  expect(addTagMenuItems.nth(0)).toHaveTextContent('string tag');

  await getByLabelText('Search tags').fill('strings');

  // After searching for something not in the list, only new tags suggestion should be shown
  expect(addTagMenuItems.elements()).toHaveLength(4);
  expect(addTagMenuItems.nth(0)).toHaveTextContent('strings');
  expect(addTagMenuItems.nth(1)).toHaveTextContent('strings: number');
  expect(addTagMenuItems.nth(2)).toHaveTextContent('strings: date');
  expect(addTagMenuItems.nth(3)).toHaveTextContent('strings: yes/no');
});

test('should be able to add tags in a note [string]', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'string-tag';

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
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}$`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(name);
});

test('should be able to add tags in a note [number]', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'number-tag';

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
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: number`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(`${name}: 10`);
});

test('should be able to add tags in a note [date]', async () => {
  vi.setSystemTime(new Date(2025, 9, 30));

  // create mock server data
  await server.createSessionMock();
  await server.createNoteMock({ content: 'A' });

  const name = 'date-tag';

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
  await getByRole('listbox', { name: 'List of tags' })
    .getByRole('option')
    .getByText(new RegExp(`${name}: yes/no`))
    .click();
  expect(addTagButton).toBeDisabled();
  const tags = tagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
  expect(tags.nth(0)).toHaveTextContent(`${name}: yes`);
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

    const { getByLabelText, getByRole, getByTestId } = await renderWithRouter();

    await vi.waitFor(() =>
      expect(getByTestId('note-card').elements()).toHaveLength(1),
    );

    // Open the modal for the first time and edit it
    await getByTestId('note-card')
      .nth(0)
      .getByRole('button', { name: /Edit note/ })
      .click();

    const tagsContainer = getByRole('dialog', {
      name: /Edit note/,
    }).getByTestId('tags-container');

    const addTagButton = tagsContainer.getByRole('button', { name: /Add tag/ });

    await addTagButton.click();

    // Initially all tags in the system should be shown
    const addTagMenu = getByRole('listbox', { name: 'List of tags' });
    const addTagMenuItems = addTagMenu.getByRole('option');
    await getByLabelText('Search tags').fill(name);
    await vi.waitFor(() => expect(addTagMenuItems.elements()).toHaveLength(1));
    await addTagMenuItems.nth(0).click();

    // After selecting the existing tag, a note tag should be visible in the note, with default values
    expect(addTagButton).toBeDisabled();
    const tags = tagsContainer.getByTestId('tag');
    await vi.waitFor(() => expect(tags.elements()).toHaveLength(1));
    expect(tags.nth(0)).toHaveTextContent(`${name}${value}`);

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

  expect(tagInput).toHaveValue(currentTagName);
  expect(tagInput.element()).toHaveFocus();
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

  expect(tagInput).toHaveValue('10');
  expect(tagInput.element()).toHaveFocus();
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

  expect(tagInput).toHaveValue('2025-10-31');
  expect(tagInput.element()).toHaveFocus();
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

  expect(tagInput).toHaveValue('YES');
  expect(tagInput.element()).toHaveFocus();
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

    const { getByRole, getByTestId } = await renderWithRouter();

    await vi.waitFor(() =>
      expect(getByTestId('note-card').elements()).toHaveLength(1),
    );

    // Open the modal for the first time and edit it
    await getByTestId('note-card')
      .nth(0)
      .getByRole('button', { name: /Edit note/ })
      .click();

    const tagsContainer = getByRole('dialog', {
      name: /Edit note/,
    }).getByTestId('tags-container');
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

  const { getByRole, getByTestId } = await renderWithRouter();
  const noteCard = getByTestId('note-card');

  await vi.waitFor(() => expect(noteCard.elements()).toHaveLength(1));

  // Open the modal for the first time and edit it
  await noteCard
    .nth(0)
    .getByRole('button', { name: /Edit note/ })
    .click();

  const fixedTagsContainer = getByRole('dialog', {
    name: /Edit note/,
  }).getByTestId('fixed-tags-container');

  const tags = fixedTagsContainer.getByTestId('tag');

  await vi.waitFor(() => expect(tags.elements()).toHaveLength(2));

  // clicks in the tag to activate edit mode
  await expect.element(tags.nth(0)).toHaveTextContent('created: 2025-11-20');
  await expect.element(tags.nth(1)).toHaveTextContent('updated: 2025-11-22');
});
