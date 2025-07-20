import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../../../cloud/router';
import { assert } from 'ts-essentials';

export const cloudApiClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const [fetchToUse, initToUse] = (() => {
          if (
            typeof init?.headers === 'object' &&
            (init.headers as Record<string, string>)['use-waf-fetch'] === 'true' &&
            import.meta.env.PROD
          ) {
            assert(window.AwsWafIntegration, 'AwsWafIntegration not loaded');

            delete (init.headers as Record<string, string>)['use-waf-fetch'];

            return [window.AwsWafIntegration.fetch, init] as const;
          }

          return [fetch, { ...init, credentials: 'include' }] as const;
        })();

        return fetchToUse(input, initToUse);
      },
      headers({ opList }) {
        if (opList[0]?.context.useWafFetch) {
          return { 'use-waf-fetch': 'true' };
        }
        return {};
      },
      transformer: superjson,
      url: `${import.meta.env.VITE_CLOUD_URL}/trpc`,
    }),
  ],
});

export type CloudApiClient = typeof cloudApiClient;
