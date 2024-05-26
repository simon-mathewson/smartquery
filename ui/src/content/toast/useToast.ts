import { useCallback, useMemo, useState } from 'react';
import type { ToastProps } from './Toast';
import { uniqueId } from 'lodash';

export const useToast = () => {
  const [queue, setQueue] = useState<ToastProps[]>([]);

  const add = useCallback((toast: Omit<ToastProps, 'id'>) => {
    setQueue((prev) => [...prev, { ...toast, id: uniqueId() }]);
  }, []);

  const remove = useCallback((id: string) => {
    setQueue((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return useMemo(() => ({ queue, add, remove }), [queue, add, remove]);
};
