import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from '@/superjson/superjson';
import type { Router } from '../../router/router';

export const trpcClient = createTRPCClient<Router>({
  links: [
    httpBatchLink({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Keeps disconnect request on beforeonload alive when the user navigates away
          keepalive: true,
        }),
      transformer: superjson,
      url: `http://localhost:${import.meta.env.VITE_PORT}`,
    }),
  ],
});
