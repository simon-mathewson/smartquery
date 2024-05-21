import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../link/src/main/router';
import superjson from 'superjson';

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Keeps disconnect request on beforeonload alive when the user navigates away
          keepalive: true,
        }),
      url: import.meta.env.VITE_LINK_URL,
    }),
  ],
});
