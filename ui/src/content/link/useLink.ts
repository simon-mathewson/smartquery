import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { trpc } from '~/trpc';

export const useLink = () => {
  const navigate = useNavigate();

  const getIsReady = useCallback(async () => {
    try {
      await trpc.status.query();
      return true;
    } catch {
      return false;
    }
  }, []);

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

  return {
    getIsReady,
    waitUntilReady,
  };
};
