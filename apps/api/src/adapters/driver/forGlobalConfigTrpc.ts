import type { DriverContext } from '@api/domain/context';
import { publicProcedure, router } from '@api/trpc';

export const globalConfigRouter = ({
  forGlobalConfig,
}: Pick<DriverContext, 'forGlobalConfig'>) =>
  router({
    findAll: publicProcedure.query(forGlobalConfig.findAll),
  });
