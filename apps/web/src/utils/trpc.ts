import { type QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink, httpLink } from '@trpc/client';
import {
  createTRPCContext,
  createTRPCOptionsProxy,
} from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import type { AppRouter, RouterInput, RouterOutput } from '@repo/api';

export type { AppRouter, RouterInput, RouterOutput };

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

const trpcLink = import.meta.env.MODE === 'test' ? httpLink : httpBatchLink;

export const trpcClient = createTRPCClient<AppRouter>({
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
});

export const makeTrpcClientOptions = (queryClient: QueryClient) =>
  createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
  });
