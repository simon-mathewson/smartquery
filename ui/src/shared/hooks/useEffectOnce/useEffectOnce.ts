import { useEffect, useRef } from 'react';

export const useEffectOnce = (effect: React.EffectCallback, options?: { enabled: boolean }) => {
  const enabled = options?.enabled ?? true;

  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current && enabled) {
      hasRun.current = true;
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
};
