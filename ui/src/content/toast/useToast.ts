import { uniqueId } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ToastProps = {
  color?: 'danger' | 'primary' | 'success';
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  description?: string;
  id: string;
  title: string;
};

export const useToast = () => {
  const [queue, setQueue] = useState<ToastProps[]>([]);

  const latestToastTimeoutRef = useRef<number | undefined>(undefined);

  const add = useCallback((toast: Omit<ToastProps, 'id'>) => {
    setQueue((prev) => [...prev, { ...toast, id: uniqueId() }]);
  }, []);

  const remove = useCallback((id: string) => {
    setQueue((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    clearTimeout(latestToastTimeoutRef.current);

    if (queue.length === 0) {
      return;
    }

    latestToastTimeoutRef.current = setTimeout(
      () => {
        setQueue((prev) => prev.slice(1));
      },
      queue[0].color === 'success' ? 3000 : 5000,
    ) as unknown as number;
  }, [queue]);

  return useMemo(() => ({ queue, add, remove }), [queue, add, remove]);
};
