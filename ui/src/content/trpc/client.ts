import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { router } from '../../../../link/src/main/content/router/router';

export const trpcClient = createTRPCProxyClient<typeof router>({
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
