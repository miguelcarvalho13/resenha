import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpLink, createTRPCClient } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';

import { type AppRouter, TRPCProvider } from '@/utils/trpc';

const trpcLink = import.meta.env.MODE === 'test' ? httpLink : httpBatchLink;

export function TrpcWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        trpcLink({
          fetch: (url, options) =>
            fetch(url, {
              ...options,
              credentials: 'include',
            }),
          url: `${window.location.origin}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
}
