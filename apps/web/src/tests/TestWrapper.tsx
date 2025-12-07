import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { type QueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { type ReactNode } from 'react';

import { TrpcWrapper } from '@/components/TrpcWrapper';
import '@/index.css';
import '@/i18n';

dayjs.extend(customParseFormat);

interface TestWrapperProps {
  children: ReactNode;
  queryClient: QueryClient;
}

export const TestWrapper = ({ children, queryClient }: TestWrapperProps) => (
  <TrpcWrapper queryClient={queryClient}>
    <MantineProvider>
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  </TrpcWrapper>
);
