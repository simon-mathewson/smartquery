import { TRPCClientError } from '@trpc/client';

export const isQuotaExceededError = (error: unknown) =>
  error instanceof TRPCClientError && error.data?.code === 'TOO_MANY_REQUESTS';
