import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNavbarPO } from '@/tests/pages/navbar';
import { createNotesPO } from '@/tests/pages/notes';
import { createFilterRowPO, createSearchesPO } from '@/tests/pages/searches';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';
import { getCurrentQueryFromUrl } from '@/utils/tests/search';

test('should be possible to click in the search within the grid to navigate to it', async () => {
  // create mock server data
  await server.createSessionMock();
  const noteA = await server.createNoteMock({ content: 'A' });
  await server.createNoteMock({ content: 'B' });

  const tag1 = await server.createTagMock({ name: 'my-tag', type: 'string' });
  await server.createNoteTagMock({
    name: tag1.name,
    note: noteA,
    tag: tag1,
    type: tag1.type,
  });

  const search = await server.createSearchMock({
    content: {
      query: [{ tagId: tag1.id, type: 'string', operator: { type: '=' } }],
    },
  });

  await renderWithRouter();
  const { searches, searchNotesButton, searchModal, searchLink } =
    createSearchesPO();
  const { header, navbarSearchesLink } = createNavbarPO();
  const { notes } = createNotesPO();

  // navigate to searches
  await header.hamburgerMenu.click();
  await navbarSearchesLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(searches.elements()).toHaveLength(1));

  // click in the link and wait for page load
  await searchLink(searches.nth(0)).click();
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/searches/${search.id}`),
  );

  // wait for searched notes to load
  await vi.waitFor(() => expect(notes.elements()).toHaveLength(1));
  await expect.element(notes.nth(0)).toHaveTextContent(/A/);

  // the search modal should have its state populated
  await expect.element(searchNotesButton).toHaveTextContent('my-tag');
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();
  const { filterRows } = searchModal;
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(1));
  await expect.element(filterRows.nth(0)).toHaveTextContent('my-tag');
});

test('should be possible to click in the search within the navbar to navigate to it', async () => {
  // create mock server data
  await server.createSessionMock();
  const tag1 = await server.createTagMock({ name: 'my-tag', type: 'string' });

  const search = await server.createSearchMock({
    favorited: true,
    content: {
      query: [{ tagId: tag1.id, type: 'string', operator: { type: '=' } }],
    },
  });

  await renderWithRouter();
  const { searchLink } = createSearchesPO();
  const { header, navbarSearches } = createNavbarPO();

  // navigate to specific search
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(navbarSearches.elements()).toHaveLength(1));

  // click in the link and wait for page load
  await searchLink(navbarSearches.nth(0)).click();
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/searches/${search.id}`),
  );
});

test('should be possible to update recorded search criteria and not save it', async () => {
  // create mock server data
  await server.createSessionMock();
  const tag1 = await server.createTagMock({ name: 'my-tag', type: 'string' });
  const tag2 = await server.createTagMock({
    name: 'other-tag',
    type: 'string',
  });

  const search = await server.createSearchMock({
    favorited: true,
    content: {
      query: [
        { tagId: tag1.id, type: 'string', operator: { type: '=' } },
        { tagId: tag2.id, type: 'string', operator: { type: '=' } },
      ],
    },
  });

  await renderWithRouter();
  const {
    searches,
    searchModal,
    searchNotesButton,
    updateSearchAlert,
    searchLink,
  } = createSearchesPO();
  const { header, navbarSearches, navbarSearchesLink } = createNavbarPO();

  // navigate to specific search
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(navbarSearches.elements()).toHaveLength(1));

  // click in the link and wait for page load
  await searchLink(navbarSearches.nth(0)).click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/searches/${search.id}`),
  );

  // the search modal should have its state populated
  await expect
    .element(searchNotesButton)
    .toHaveTextContent('my-tag and other-tag');
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();
  const { filterRows } = searchModal;
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(2));
  await expect.element(filterRows.nth(0)).toHaveTextContent('my-tag');
  await expect.element(filterRows.nth(1)).toHaveTextContent('other-tag');

  // updating the modal state, should reflect the search criteria
  const secondRow = createFilterRowPO({ row: filterRows.nth(1) });
  await secondRow.removeButton.click();
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(1));
  await searchModal.searchButton.click();
  await searchModal.expectNotToBeVisible();
  await expect.element(searchNotesButton).toHaveTextContent('my-tag');
  expect(window.location.pathname).toBe(`/searches/${search.id}`);
  expect(getCurrentQueryFromUrl()).to.deep.eq([
    { tagId: tag1.id, type: 'string', operator: { type: '=' } },
  ]);

  // navigating to /searches, we should see that there's no extra search there
  await header.hamburgerMenu.click();
  await navbarSearchesLink.click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(searches.elements()).toHaveLength(1));

  // navigating back to the search, we should see the original recorded state
  await header.hamburgerMenu.click();
  await searchLink(navbarSearches.nth(0)).click();
  await header.hamburgerMenu.click();
  await expect
    .element(searchNotesButton)
    .toHaveTextContent('my-tag and other-tag');
  expect(getCurrentQueryFromUrl()).to.deep.eq([]);
  await expect.element(updateSearchAlert.it).not.toBeInTheDocument();
});

test('should be possible to update recorded search criteria and save it', async () => {
  // create mock server data
  await server.createSessionMock();
  const tag1 = await server.createTagMock({ name: 'my-tag', type: 'string' });
  const tag2 = await server.createTagMock({
    name: 'other-tag',
    type: 'string',
  });

  const search = await server.createSearchMock({
    favorited: true,
    content: {
      query: [
        { tagId: tag1.id, type: 'string', operator: { type: '=' } },
        { tagId: tag2.id, type: 'string', operator: { type: '=' } },
      ],
    },
  });

  await renderWithRouter();
  const { searchModal, searchNotesButton, updateSearchAlert, searchLink } =
    createSearchesPO();
  const { header, navbarSearches } = createNavbarPO();

  // navigate to specific search
  await header.hamburgerMenu.click();
  await vi.waitFor(() => expect(navbarSearches.elements()).toHaveLength(1));

  // click in the link and wait for page load
  await searchLink(navbarSearches.nth(0)).click();
  await header.hamburgerMenu.click();
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/searches/${search.id}`),
  );

  // the search modal should have its state populated
  await expect
    .element(searchNotesButton)
    .toHaveTextContent('my-tag and other-tag');
  await searchNotesButton.click();
  await searchModal.expectToBeVisible();
  const { filterRows } = searchModal;
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(2));
  await expect.element(filterRows.nth(0)).toHaveTextContent('my-tag');
  await expect.element(filterRows.nth(1)).toHaveTextContent('other-tag');

  // updating the modal state, should reflect the search criteria
  const secondRow = createFilterRowPO({ row: filterRows.nth(1) });
  await secondRow.removeButton.click();
  await vi.waitFor(() => expect(filterRows.elements()).toHaveLength(1));
  await searchModal.searchButton.click();
  await searchModal.expectNotToBeVisible();
  await expect.element(searchNotesButton).toHaveTextContent('my-tag');
  expect(window.location.pathname).toBe(`/searches/${search.id}`);
  expect(getCurrentQueryFromUrl()).to.deep.eq([
    { tagId: tag1.id, type: 'string', operator: { type: '=' } },
  ]);

  // an alert should be present
  await expect
    .element(updateSearchAlert.it)
    .toHaveTextContent(
      /The current search filters doesn't match the recorded search filters. Do you want to update your search\?/,
    );
  await updateSearchAlert.updateButton.click();
  await expect.element(updateSearchAlert.it).not.toBeInTheDocument();
  expect(window.location.pathname).toBe(`/searches/${search.id}`);
  expect(getCurrentQueryFromUrl()).to.deep.eq([]);
});
