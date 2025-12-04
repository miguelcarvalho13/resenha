import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNavbarPO } from '@/tests/pages/navbar';
import { createFilterRowPO, createSearchesPO } from '@/tests/pages/searches';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

test('should be possible to see stored searches within /searches', async () => {
  // create mock server data
  await server.createSessionMock();
  const tag1 = await server.createTagMock({ name: 'my-tag', type: 'string' });
  const tag2 = await server.createTagMock({
    name: 'my-other-tag',
    type: 'string',
  });
  const tag3 = await server.createTagMock({
    name: 'boolean-tag',
    type: 'boolean',
  });
  const tag4 = await server.createTagMock({
    name: 'number-tag',
    type: 'number',
  });
  const tag5 = await server.createTagMock({ name: 'date-tag', type: 'date' });

  await server.createSearchMock({
    content: {
      query: [
        { field: 'deleted', operator: { type: '=', value: '2000-01-01' } },
      ],
    },
  });
  await server.createSearchMock({
    content: {
      query: [
        { tagId: tag1.id, type: 'string', operator: { type: '=' } },
        { tagId: tag2.id, type: 'string', operator: { type: '=' } },
      ],
    },
  });
  await server.createSearchMock({
    content: {
      query: [
        {
          tagId: tag3.id,
          type: 'boolean',
          operator: { type: '=', value: false },
        },
        { tagId: tag4.id, type: 'number', operator: { type: '>=', value: 10 } },
        {
          tagId: tag5.id,
          type: 'date',
          operator: { type: '>', value: '2000-01-01' },
        },
      ],
    },
  });

  await renderWithRouter();
  const { searches } = createSearchesPO();
  const { header, navbarSearchesLink } = createNavbarPO();

  // navigate to searches
  await header.hamburgerMenu.click();
  await navbarSearchesLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(searches.elements()).toHaveLength(3));

  // validate cards texts
  await expect
    .element(searches.nth(0))
    .toHaveTextContent(/deleted = 2000-01-01/);
  await expect
    .element(searches.nth(1))
    .toHaveTextContent(/my-tag and my-other-tag/);
  await expect
    .element(searches.nth(2))
    .toHaveTextContent(
      /boolean-tag is NO and number-tag >= 10 and date-tag > 2000-01-01/,
    );
});

test('should store searches made within the search modal', async () => {
  // create mock server data
  await server.createSessionMock();
  await server.createTagMock({ name: 'my-tag', type: 'string' });

  await renderWithRouter();
  const { searches, searchNotesButton, searchModal } = createSearchesPO();
  const { header, navbarSearchesLink } = createNavbarPO();

  // Open search modal
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();

  // Add tag filters
  await searchModal.addTagButton.click();

  // tag search
  const firstRow = createFilterRowPO({ row: searchModal.filterRows.nth(0) });
  await firstRow.tagInput.fill('my-tag');
  await firstRow.tagInputDropdownOptions.getByText(/my-tag/).click();

  // Submit search
  await searchModal.searchButton.click();
  await searchModal.expectNotToBeVisible();

  // navigate to searches
  await header.hamburgerMenu.click();
  await navbarSearchesLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(searches.elements()).toHaveLength(1));

  // validate cards texts
  await expect.element(searches.nth(0)).toHaveTextContent(/my-tag/);
});
