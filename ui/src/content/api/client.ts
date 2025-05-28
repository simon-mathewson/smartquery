import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { appRouter } from '../../../../api/router';

export const apiClient = createTRPCProxyClient<typeof appRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Sends cookies cross-origin
          credentials: 'include',
        }),
      url: `${import.meta.env.VITE_API_URL}/trpc`,
    }),
  ],
});

export type ApiClient = typeof apiClient;
