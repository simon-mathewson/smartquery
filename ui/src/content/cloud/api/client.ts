import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { appRouter } from '../../../../../cloud/router';

export const cloudApiClient = createTRPCProxyClient<typeof appRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Sends cookies cross-origin
          credentials: 'include',
        }),
      url: `${import.meta.env.VITE_CLOUD_URL}/trpc`,
    }),
  ],
});

export type CloudApiClient = typeof cloudApiClient;
