import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TrpcContext } from '../trpc/Context';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';

export const useLink = () => {
  const navigate = useNavigate();

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

  useEffectOnce(() => {
    getIsReady().then((isReady) => {
      if (!isReady) {
        navigate(routes.setup());
      }
    });
  });

  return useMemo(
    () => ({
      getIsReady,
      waitUntilReady,
    }),
    [getIsReady, waitUntilReady],
  );
};
