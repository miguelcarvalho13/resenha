import { type Locator } from '@vitest/browser/context';
import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { type Tag } from '@/models/tags';
import {
  renderWithRouter,
  type RenderWithRouterContext,
} from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { searchNotesSchema, type SearchNotesSchemaType } from '@repo/api';

const createFilterRowPO = ({
  getByRole,
  row,
}: {
  getByRole: RenderWithRouterContext['getByRole'];
  row: Locator;
}) => {
  const tagInput = row.getByLabelText('Tag');
  const tagInputDropdown = getByRole('listbox', { name: 'List of tags' });
  const tagInputDropdownOptions = tagInputDropdown.getByRole('option');
  const operatorInput = row.getByLabelText('Operator');
  const operatorInputDropdown = getByRole('listbox', { name: 'Operator' });
  const operatorInputOptions = operatorInputDropdown.getByRole('option');
  const valueInput = row.getByLabelText('Value');
  const valueInputDropdown = getByRole('listbox', { name: 'Value' });
  const valueInputOptions = valueInputDropdown.getByRole('option');

  return {
    tagInput,
    tagInputDropdown,
    tagInputDropdownOptions,
    operatorInput,
    operatorInputDropdown,
    operatorInputOptions,
    valueInput,
    valueInputDropdown,
    valueInputOptions,
  };
};

type TagFilterRowPO = ReturnType<typeof createFilterRowPO>;

const assertRowOperatorOptions = async ({
  row,
  type,
}: {
  row: TagFilterRowPO;
  type: Tag['type'];
}) => {
  switch (type) {
    case 'string':
      await expect.element(row.operatorInput).not.toBeInTheDocument();
      break;
    case 'boolean':
      await expect.element(row.operatorInput).toBeDisabled();
      await expect.element(row.operatorInput).toHaveValue('equals to');
      break;
    case 'date':
    case 'number':
      await expect.element(row.operatorInput).toBeEnabled();
      await expect
        .element(row.operatorInputOptions.nth(0))
        .toHaveAttribute('value', '<');
      await expect
        .element(row.operatorInputOptions.nth(0))
        .toHaveTextContent('less than');
      await expect
        .element(row.operatorInputOptions.nth(1))
        .toHaveAttribute('value', '<=');
      await expect
        .element(row.operatorInputOptions.nth(1))
        .toHaveTextContent('less than or equals to');
      await expect
        .element(row.operatorInputOptions.nth(2))
        .toHaveAttribute('value', '=');
      await expect
        .element(row.operatorInputOptions.nth(2))
        .toHaveTextContent('equals to');
      await expect
        .element(row.operatorInputOptions.nth(3))
        .toHaveAttribute('value', '>');
      await expect
        .element(row.operatorInputOptions.nth(3))
        .toHaveTextContent('greater than');
      await expect
        .element(row.operatorInputOptions.nth(4))
        .toHaveAttribute('value', '>=');
      await expect
        .element(row.operatorInputOptions.nth(4))
        .toHaveTextContent('greater than or equals to');
      break;

    default:
      throw new Error('Tag type not defined');
  }
};

const getCurrentQueryFromUrl = () => {
  const queryString = new URLSearchParams(window.location.search).get('query');

  if (!queryString) throw new Error('`query` not found in query params');

  return searchNotesSchema().shape.query.parse(
    JSON.parse(decodeURIComponent(queryString)),
  );
};

test('should correctly search for notes', async () => {
  // create mock server data
  await server.createSessionMock();
  const noteA = await server.createNoteMock({ content: 'A' });
  const noteB = await server.createNoteMock({ content: 'B' });

  // Apply string tag
  const stringTag = await server.createTagMock({
    name: 'string-tag',
    type: 'string',
  });

  await server.createNoteTagMock({
    name: stringTag.name,
    note: noteA,
    tag: stringTag,
    type: stringTag.type,
  });

  // Apply number tag
  const numberTag = await server.createTagMock({
    name: 'number-tag',
    type: 'number',
  });

  await server.createNoteTagMock({
    name: numberTag.name,
    note: noteA,
    tag: numberTag,
    type: numberTag.type,
    value: 10,
  });

  await server.createNoteTagMock({
    name: numberTag.name,
    note: noteB,
    tag: numberTag,
    type: numberTag.type,
    value: 11,
  });

  // Apply boolean tag
  const booleanTag = await server.createTagMock({
    name: 'boolean-tag',
    type: 'boolean',
  });

  await server.createNoteTagMock({
    name: booleanTag.name,
    note: noteA,
    tag: booleanTag,
    type: booleanTag.type,
    value: false,
  });

  await server.createNoteTagMock({
    name: booleanTag.name,
    note: noteB,
    tag: booleanTag,
    type: booleanTag.type,
    value: true,
  });

  // Apply date tag
  const dateTag = await server.createTagMock({
    name: 'date-tag',
    type: 'date',
  });

  await server.createNoteTagMock({
    name: dateTag.name,
    note: noteA,
    tag: dateTag,
    type: dateTag.type,
    value: '2025-10-10',
  });

  await server.createNoteTagMock({
    name: dateTag.name,
    note: noteB,
    tag: dateTag,
    type: dateTag.type,
    value: '2025-10-09',
  });

  const { getByTestId, getByRole } = await renderWithRouter();

  // Wait first load
  const notes = getByTestId('note-card');
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(2));
  expect(notes.nth(0)).toHaveTextContent('A');
  expect(notes.nth(1)).toHaveTextContent('B');

  // Open search modal
  await getByRole('button', { name: /Search notes/ }).click();
  const searchModal = getByRole('dialog', { name: /Search notes/ });
  await expect.element(searchModal).toBeVisible();

  // Add tag filters
  const tagsContainer = searchModal.getByTestId('tags-filter-container');
  const addTagButton = searchModal.getByRole('button', { name: /Add tag/ });
  await addTagButton.click();

  // string-tag search
  const firstRow = createFilterRowPO({
    getByRole,
    row: tagsContainer.getByTestId('tags-filter').nth(0),
  });

  await firstRow.tagInput.fill('string-tag');
  await firstRow.tagInputDropdownOptions
    .getByText(new RegExp('string-tag'))
    .click();
  await assertRowOperatorOptions({ row: firstRow, type: 'string' });

  // number-tag search
  await addTagButton.click();
  const secondRow = createFilterRowPO({
    getByRole,
    row: tagsContainer.getByTestId('tags-filter').nth(1),
  });

  await secondRow.tagInput.fill('number-tag');
  await secondRow.tagInputDropdownOptions
    .getByText(new RegExp('number-tag'))
    .click();
  await secondRow.operatorInput.click();
  await assertRowOperatorOptions({ row: secondRow, type: 'number' });
  await secondRow.operatorInputOptions
    .getByText('less than or equals to')
    .click();
  await secondRow.valueInput.fill('10');

  // boolean-tag search
  await addTagButton.click();
  const thirdRow = createFilterRowPO({
    getByRole,
    row: tagsContainer.getByTestId('tags-filter').nth(2),
  });

  await thirdRow.tagInput.fill('boolean-tag');
  await thirdRow.tagInputDropdownOptions
    .getByText(new RegExp('boolean-tag'))
    .click();
  await assertRowOperatorOptions({ row: thirdRow, type: 'boolean' });
  await thirdRow.valueInput.click();
  await thirdRow.valueInputOptions.getByText('NO').click();

  // date-tag search
  await addTagButton.click();
  const fourthRow = createFilterRowPO({
    getByRole,
    row: tagsContainer.getByTestId('tags-filter').nth(3),
  });

  await fourthRow.tagInput.fill('date-tag');
  await fourthRow.tagInputDropdownOptions
    .getByText(new RegExp('date-tag'))
    .click();
  await fourthRow.operatorInput.click();
  await assertRowOperatorOptions({ row: fourthRow, type: 'date' });
  await fourthRow.operatorInputOptions
    .getByText('greater than or equals to')
    .click();
  await fourthRow.valueInput.fill('2025-10-10');

  // Submit search and assert notes
  await searchModal.getByRole('button', { name: /Search/ }).click();
  await expect.element(searchModal).not.toBeInTheDocument();
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));
  expect(notes.nth(0)).toHaveTextContent('A');
  expect(getCurrentQueryFromUrl()).to.deep.eq([
    { tagId: stringTag.id, type: 'string', operator: { type: '=' } },
    {
      tagId: numberTag.id,
      type: 'number',
      operator: { type: '<=', value: 10 },
    },
    {
      tagId: booleanTag.id,
      type: 'boolean',
      operator: { type: '=', value: false },
    },
    {
      tagId: dateTag.id,
      type: 'date',
      operator: { type: '>=', value: '2025-10-10' },
    },
  ] satisfies SearchNotesSchemaType['query']);
});
