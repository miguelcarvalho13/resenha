import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { type makeTrpcClientOptions } from '@/utils/trpc';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: ReturnType<typeof makeTrpcClientOptions>;
}>()({
  component: RootRoute,
});

function RootRoute() {
  return <Outlet />;
}
