import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../../../cloud/router';

export const cloudApiClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Sends cookies cross-origin
          credentials: 'include',
        }),
      transformer: superjson,
      url: `${import.meta.env.VITE_CLOUD_URL}/trpc`,
    }),
  ],
});

export type CloudApiClient = typeof cloudApiClient;
