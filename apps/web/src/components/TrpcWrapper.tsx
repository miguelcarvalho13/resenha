import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';

import { trpc } from '@/utils/trpc';

const trpcLink = import.meta.env.MODE === 'test' ? httpLink : httpBatchLink;

export function TrpcWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
