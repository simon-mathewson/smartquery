import { useCallback, useMemo, useRef, useState } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LinkApiContext } from '../link/api/Context';

export const useLink = () => {
  const linkApi = useDefinedContext(LinkApiContext);

  const isReadyRef = useRef<boolean | null>(null);
  const [isReady, setIsReady] = useState<boolean | null>(null);

  const checkIfReady = useCallback(async () => {
    try {
      await linkApi.status.query();
      setIsReady(true);
      isReadyRef.current = true;
      return true;
    } catch {
      setIsReady(false);
      isReadyRef.current = false;
      return false;
    }
  }, [linkApi]);

  const waitUntilReady = useCallback(async () => {
    while (isReadyRef.current === null) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }, []);

  return useMemo(
    () => ({
      checkIfReady,
      isReady,
      waitUntilReady,
    }),
    [checkIfReady, isReady, waitUntilReady],
  );
};
