import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { type ReactNode } from 'react';

import { TrpcWrapper } from '@/components/TrpcWrapper';
import '@/index.css';
import '@/i18n';

dayjs.extend(customParseFormat);

interface TestWrapperProps {
  children: ReactNode;
}

export const TestWrapper = ({ children }: TestWrapperProps) => (
  <TrpcWrapper>
    <MantineProvider>
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  </TrpcWrapper>
);
