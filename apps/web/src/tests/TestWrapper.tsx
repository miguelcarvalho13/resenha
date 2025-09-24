import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { type ReactNode } from 'react';

import { TrpcWrapper } from '@/components/TrpcWrapper';
import '@/index.css';

interface TestWrapperProps {
  children: ReactNode;
}

export const TestWrapper = ({ children }: TestWrapperProps) => (
  <TrpcWrapper>
    <MantineProvider>{children}</MantineProvider>
  </TrpcWrapper>
);
