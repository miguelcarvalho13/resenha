import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { trpcClient, TRPCProvider } from '@/utils/trpc';

export function TrpcWrapper({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
}
