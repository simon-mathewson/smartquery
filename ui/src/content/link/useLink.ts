import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
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
  }, [trpc]);

  const waitUntilReady = useCallback(async () => {
    while (!(await getIsReady())) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }, [getIsReady]);

  return useMemo(
    () => ({
      getIsReady,
      waitUntilReady,
    }),
    [getIsReady, waitUntilReady],
  );
};
