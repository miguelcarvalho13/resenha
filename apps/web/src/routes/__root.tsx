import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { type trpcClient } from '@/utils/trpc';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpcClient: typeof trpcClient;
}>()({
  component: RootRoute,
});

function RootRoute() {
  return <Outlet />;
}
