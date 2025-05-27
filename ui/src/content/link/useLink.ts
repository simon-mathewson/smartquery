import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LinkApiContext } from '../link/api/Context';

export const useLink = () => {
  const linkApi = useDefinedContext(LinkApiContext);

  const getIsReady = useCallback(async () => {
    try {
      await linkApi.status.query();
      return true;
    } catch {
      return false;
    }
  }, [linkApi]);

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
