import { useEffect, useRef } from 'react';

export type UseEffectOnceOptions = { enabled: boolean };

export const useEffectOnce = (effect: React.EffectCallback, options?: UseEffectOnceOptions) => {
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
