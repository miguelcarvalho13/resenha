import { expect, vi } from 'vitest';

import { server } from '@/mocks/server';
import { createNavbarPO } from '@/tests/pages/navbar';
import { createNotesPO } from '@/tests/pages/notes';
import { createSearchesPO } from '@/tests/pages/searches';
import { renderWithRouter } from '@/tests/renderUtils';
import { test } from '@/tests/testExtend';

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
  const { searches, searchLink } = createSearchesPO();
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
