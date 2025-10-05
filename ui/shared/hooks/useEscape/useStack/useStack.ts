import { useCallback, useMemo, useState } from 'react';

export const useEscapeStack = () => {
  const [stack, setStack] = useState<string[]>([]);

  const add = useCallback((id: string) => {
    setStack((current) => [...current, id]);
  }, []);

  const remove = useCallback((id: string) => {
    setStack((current) => current.filter((currentId) => currentId !== id));
  }, []);

  return useMemo(() => ({ add, remove, stack }), [add, remove, stack]);
};
