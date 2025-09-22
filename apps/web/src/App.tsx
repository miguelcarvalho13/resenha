import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { TrpcWrapper } from './components/TrpcWrapper';
import './index.css';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <TrpcWrapper>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </TrpcWrapper>
  );
}
