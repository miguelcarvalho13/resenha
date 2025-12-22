import { Collection } from '@msw/data';
import z from 'zod';

import type { GlobalConfig } from '@/models/globalConfig';

export const globalConfigMockSchema = z.object({
  isEmailSignupEnabled: z.boolean(),
  isInviteCodesEnabled: z.boolean(),
}) satisfies z.ZodType<GlobalConfig>;

export const globalConfigMock = new Collection({
  schema: globalConfigMockSchema,
});

export type GlobalConfigMockSchemaType = z.infer<typeof globalConfigMockSchema>;
