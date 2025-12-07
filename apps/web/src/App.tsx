import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { QueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { TrpcWrapper } from './components/TrpcWrapper';
import './index.css';
import { routeTree } from './routeTree.gen';
import './i18n';
import { makeTrpcClientOptions } from '@/utils/trpc';

dayjs.extend(customParseFormat);

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: { queryClient, trpc: makeTrpcClientOptions(queryClient) },
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <TrpcWrapper queryClient={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <RouterProvider router={router} />
        </ModalsProvider>
      </MantineProvider>
    </TrpcWrapper>
  );
}
