import { createTRPCClient, httpBatchLink, httpBatchStreamLink } from '@trpc/client';
import superjson from 'superjson';
import type { CloudRouter } from '../../../../../cloud/router';
import { assert } from 'ts-essentials';

const batchLinkInput = {
  fetch: (input: RequestInfo | URL, initProp?: RequestInit) => {
    const init = {
      ...initProp,
      // Keeps disconnect request on beforeonload alive when the user navigates away
      keepalive: true,
    };

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
} satisfies Parameters<typeof httpBatchStreamLink>[0];

export const cloudApi = {
  cloudApi: createTRPCClient<CloudRouter>({
    links: [httpBatchLink(batchLinkInput)],
  }),
  cloudApiStream: createTRPCClient<CloudRouter>({
    links: [httpBatchStreamLink(batchLinkInput)],
  }),
} as const;
