import { initTRPC, TRPCError, type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { fromNodeHeaders } from 'better-auth/node';
import { type IncomingHttpHeaders } from 'http';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { auth } from '@api/auth';
import { db } from "@api/db";
import type { AppRouter } from '@api/router';


export const createTRPCContext = async (opts: { headers: IncomingHttpHeaders }) => {
  const headers = fromNodeHeaders(opts.headers);

  const authSession = await auth.api.getSession({
    headers,
  })

  const source = headers.get('x-trpc-source') ?? 'unknown'
  console.log('>>> tRPC Request from', source, 'by', authSession?.user.email)

  return {
    db,
    user: authSession?.user
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
    }
  })
})

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
