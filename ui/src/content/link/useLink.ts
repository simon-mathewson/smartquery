import { useCallback } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TrpcContext } from '../trpc/Context';

export const useLink = () => {
  const trpc = useDefinedContext(TrpcContext);

  const getIsReady = useCallback(async () => {
    try {
      await trpc.status.query();
      return true;
    } catch {
      return false;
    }
  }, [trpc.status]);

  const waitUntilReady = useCallback(async () => {
    while (!(await getIsReady())) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }, [getIsReady]);

  return {
    getIsReady,
    waitUntilReady,
  };
};
