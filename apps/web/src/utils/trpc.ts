import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter, RouterInput, RouterOutput } from '@repo/api';

export type { AppRouter, RouterInput, RouterOutput };

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();
