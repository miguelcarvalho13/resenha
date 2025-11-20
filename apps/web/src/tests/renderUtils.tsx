import { createRouter, RouterProvider } from '@tanstack/react-router';
import { act } from 'react';
import { render } from 'vitest-browser-react';

import { routeTree } from '@/routeTree.gen';
import { type IndexSearchParams } from '@/routes/index';
import { TestWrapper } from './TestWrapper';

const getTestRouter = () => {
  const router = createRouter({
    defaultPendingMinMs: 0,
    routeTree,
  });

  return router;
};

/**
 * Renders the index route for testing purposes.
 */
export async function renderWithRouter({
  search,
}: { search?: IndexSearchParams } = {}) {
  const router = getTestRouter();

  const renderResult = render(
    <TestWrapper>
      <RouterProvider<typeof router> router={router} />
    </TestWrapper>,
  );

  await act(() => router.navigate({ to: '/', search }));

  return {
    router,
    ...renderResult,
  };
}

export type RenderWithRouterContext = Awaited<
  ReturnType<typeof renderWithRouter>
>;
