import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { router } from '../../content/router/router';

export const getTrpcClient = () =>
  createTRPCProxyClient<typeof router>({
    transformer: superjson,
    links: [
      httpBatchLink({
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            // Keeps disconnect request on beforeonload alive when the user navigates away
            keepalive: true,
          }),
        url: `http://localhost:${import.meta.env.VITE_PORT}`,
      }),
    ],
  });
