import { createRouter, RouterProvider } from '@tanstack/react-router';
import { act } from 'react';
import { render } from 'vitest-browser-react';

import { TestWrapper } from './TestWrapper';
import { routeTree } from '@/routeTree.gen';

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
export async function renderWithRouter() {
  const router = getTestRouter();

  const renderResult = render(
    <TestWrapper>
      <RouterProvider<typeof router> router={router} />
    </TestWrapper>,
  );

  await act(() => router.navigate({ to: '/' }));

  return {
    router,
    ...renderResult,
  };
}

export type RenderWithRouterContext = Awaited<
  ReturnType<typeof renderWithRouter>
>;
