import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { NO_OPTION_VALUE, type Tag } from '@/models/tags';
import { createFilterRowPO, createSearchesPO } from '@/tests/pages/searches';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { searchNotesSchema, type SearchNotesSchemaType } from '@repo/api';
import { createNotesPO } from '@/tests/pages/notes';

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

  if (!queryString) return [];

  return searchNotesSchema().shape.query.parse(
    JSON.parse(decodeURIComponent(queryString)),
  );
};

const setupCommonData = async () => {
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

  return { noteA, noteB, stringTag, dateTag, booleanTag, numberTag };
};

test('should correctly search for notes', async () => {
  // create mock server data
  const { stringTag, numberTag, booleanTag, dateTag } = await setupCommonData();

  await renderWithRouter();
  const { notes } = createNotesPO();
  const { searchNotesButton, searchModal } = createSearchesPO();

  // Wait first load
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(2));
  expect(notes.nth(0)).toHaveTextContent('A');
  expect(notes.nth(1)).toHaveTextContent('B');

  // Open search modal
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();

  // Add tag filters
  await searchModal.addTagButton.click();

  // string-tag search
  const firstRow = createFilterRowPO({ row: searchModal.filterRows.nth(0) });

  await firstRow.tagInput.fill('string-tag');
  await firstRow.tagInputDropdownOptions
    .getByText(new RegExp('string-tag'))
    .click();
  await assertRowOperatorOptions({ row: firstRow, type: 'string' });

  // number-tag search
  await searchModal.addTagButton.click();
  const secondRow = createFilterRowPO({ row: searchModal.filterRows.nth(1) });

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
  await searchModal.addTagButton.click();
  const thirdRow = createFilterRowPO({ row: searchModal.filterRows.nth(2) });

  await thirdRow.tagInput.fill('boolean-tag');
  await thirdRow.tagInputDropdownOptions
    .getByText(new RegExp('boolean-tag'))
    .click();
  await assertRowOperatorOptions({ row: thirdRow, type: 'boolean' });
  await thirdRow.valueInput.click();
  await thirdRow.valueInputOptions.getByText('NO').click();

  // date-tag search
  await searchModal.addTagButton.click();
  const fourthRow = createFilterRowPO({ row: searchModal.filterRows.nth(3) });

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
  await searchModal.searchButton.click();
  await searchModal.expectNotToBeVisible();
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

test('should correctly restore search based on query params', async () => {
  // create mock server data
  const { stringTag, numberTag, booleanTag, dateTag } = await setupCommonData();

  const query = [
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
  ] satisfies SearchNotesSchemaType['query'];

  await renderWithRouter({ search: { query } });
  const { searchNotesButton, searchModal } = createSearchesPO();

  // URL should be restored
  expect(getCurrentQueryFromUrl()).to.deep.eq(query);

  // Open search modal
  await expect
    .element(searchNotesButton)
    .toHaveTextContent(
      'string-tag and number-tag <= 10 and boolean-tag is NO and date-tag >= 2025-10-10',
    );
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();

  // Assert filter rows
  const { filterRows } = searchModal;
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(4));
  const firstRow = createFilterRowPO({ row: filterRows.nth(0) });
  const secondRow = createFilterRowPO({ row: filterRows.nth(1) });
  const thirdRow = createFilterRowPO({ row: filterRows.nth(2) });
  const fourthRow = createFilterRowPO({ row: filterRows.nth(3) });

  // first row
  await expect.element(filterRows.nth(0)).toHaveTextContent(stringTag.name);
  await expect.element(firstRow.operatorInput).not.toBeInTheDocument();
  await expect.element(firstRow.valueInput).not.toBeInTheDocument();

  // second row
  await expect.element(filterRows.nth(1)).toHaveTextContent(numberTag.name);
  await expect
    .element(secondRow.operatorInput)
    .toHaveValue('less than or equals to');
  console.log(secondRow.valueInput.selector);
  await expect.element(secondRow.valueInput).toHaveValue('10');

  // third row
  await expect.element(filterRows.nth(2)).toHaveTextContent(booleanTag.name);
  await expect.element(thirdRow.operatorInput).toHaveValue('equals to');
  await expect.element(thirdRow.valueInput).toHaveValue(NO_OPTION_VALUE);

  // fourth row
  await expect.element(filterRows.nth(3)).toHaveTextContent(dateTag.name);
  await expect
    .element(fourthRow.operatorInput)
    .toHaveValue('greater than or equals to');
  await expect.element(fourthRow.valueInput).toHaveValue('2025-10-10');
});

test('should be possible to remove rows from search modal', async () => {
  await renderWithRouter();
  const { searchNotesButton, searchModal } = createSearchesPO();
  const { filterRows } = searchModal;

  // Open search modal
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();

  // Add tag filter row
  await searchModal.addTagButton.click();
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(1));

  // Remove tag filter row
  await filterRows
    .nth(0)
    .getByRole('button', { name: /Remove/ })
    .click();
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(0));
});

test('should be possible to clear search through the search modal', async () => {
  // create mock server data
  const { stringTag, numberTag, booleanTag, dateTag } = await setupCommonData();

  const query = [
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
  ] satisfies SearchNotesSchemaType['query'];

  await renderWithRouter({ search: { query } });
  const { searchNotesButton, searchModal } = createSearchesPO();

  // Open search modal
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();

  // Clear search
  await searchModal.clearSearchButton.click();
  await searchModal.expectNotToBeVisible();
  expect(getCurrentQueryFromUrl()).to.deep.eq([]);
});
