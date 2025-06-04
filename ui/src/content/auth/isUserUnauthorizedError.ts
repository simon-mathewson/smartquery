import { TRPCClientError } from '@trpc/client';

export const isUserUnauthorizedError = (error: unknown) =>
  error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED';
