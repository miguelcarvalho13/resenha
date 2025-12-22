import { delay, http, type PathParams } from 'msw';

import { createTrpcJson, type TrpcInput } from '@/mocks/factories/trpc';
import { globalConfigMock } from '@/mocks/models/globalConfig';
import { server } from '@/mocks/server';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';

export const getGlobalConfigHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.get<PathParams, TrpcInput<RouterInput['globalConfig']['findAll']>>(
    '/api/trpc/globalConfig.findAll',
    async () => {
      await delay(wait || server.timing);

      const globalConfig = globalConfigMock.findFirst();

      if (!globalConfig) {
        const newGlobalConfig = await server.createGlobalConfigMock();

        return createTrpcJson({
          ...newGlobalConfig,
        } satisfies RouterOutput['globalConfig']['findAll']);
      }

      return createTrpcJson({
        ...globalConfig,
      } satisfies RouterOutput['globalConfig']['findAll']);
    },
  );
