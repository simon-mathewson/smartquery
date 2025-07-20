import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../../../cloud/router';
import { assert } from 'ts-essentials';

export const cloudApiClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const fetchToUse = (() => {
          if (
            typeof init?.headers === 'object' &&
            (init.headers as Record<string, string>)['use-waf-fetch'] === 'true'
          ) {
            assert(window.AwsWafIntegration, 'AwsWafIntegration not loaded');

            delete (init.headers as Record<string, string>)['use-waf-fetch'];

            return window.AwsWafIntegration.fetch;
          }

          return fetch;
        })();

        return fetchToUse(input, {
          ...init,
          // Sends cookies cross-origin
          credentials: 'include',
        });
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
