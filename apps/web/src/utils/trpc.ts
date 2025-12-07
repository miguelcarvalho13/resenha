import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { AppRouter, RouterInput, RouterOutput } from '@repo/api';

export type { AppRouter, RouterInput, RouterOutput };

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
