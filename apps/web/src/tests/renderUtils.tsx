import { QueryClient } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { act } from 'react';
import { render } from 'vitest-browser-react';

import { routeTree } from '@/routeTree.gen';
import { type HomeSearchParams } from '@/routes/_authenticated/home';
import { makeTrpcClientOptions } from '@/utils/trpc';
import { TestWrapper } from './TestWrapper';

const getTestRouter = ({ queryClient }: { queryClient: QueryClient }) => {
  const router = createRouter({
    context: { queryClient, trpc: makeTrpcClientOptions(queryClient) },
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
}: { search?: HomeSearchParams } = {}) {
  const queryClient = new QueryClient();
  const router = getTestRouter({ queryClient });

  const renderResult = render(
    <TestWrapper queryClient={queryClient}>
      <RouterProvider<typeof router> router={router} />
    </TestWrapper>,
  );

  await act(() => router.navigate({ to: '/home', search }));

  return {
    router,
    ...renderResult,
  };
}

export type RenderWithRouterContext = Awaited<
  ReturnType<typeof renderWithRouter>
>;
