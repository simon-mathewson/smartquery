import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { appRouter } from '../../../../api/router';

export const apiClient = createTRPCProxyClient<typeof appRouter>({
  transformer: superjson,
  links: [httpBatchLink({ url: `${import.meta.env.VITE_API_URL}/trpc` })],
});

export type ApiClient = typeof apiClient;
