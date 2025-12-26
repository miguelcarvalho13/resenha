import { z } from 'zod';

import { userSchema } from './users';

export const sessionSchema = () =>
  z.object({
    user: z.object(userSchema().shape),
  });

export type Session = z.infer<ReturnType<typeof sessionSchema>>;
