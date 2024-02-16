import { useCallback, useMemo, useState } from 'react';
import type { HtmlRef } from '~/shared/types';

export const useQueue = () => {
  const [refs, setRefs] = useState<HtmlRef[]>([]);

  const addRef = useCallback((ref: HtmlRef) => {
    setRefs((current) => [...current, ref]);
  }, []);

  const removeRef = useCallback((ref: HtmlRef) => {
    setRefs((current) => current.filter((currentRef) => currentRef !== ref));
  }, []);

  return useMemo(() => ({ addRef, refs, removeRef }), [addRef, refs, removeRef]);
};
