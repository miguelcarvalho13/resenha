import { z } from 'zod';

export const userSchema = () =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    email: z.email(),
    emailVerified: z.boolean(),
    name: z.string(),
    image: z.url().nullish(),
  });

export type User = z.infer<ReturnType<typeof userSchema>>;
