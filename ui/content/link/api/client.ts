import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from '@/superjson/superjson';
import type { router } from '../../../../link/src/main/router/router';

export const linkApiClient = createTRPCClient<typeof router>({
  links: [
    httpBatchLink({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Keeps disconnect request on beforeonload alive when the user navigates away
          keepalive: true,
        }),
      transformer: superjson,
      url: import.meta.env.VITE_LINK_URL,
    }),
  ],
});

export type LinkApiClient = typeof linkApiClient;
