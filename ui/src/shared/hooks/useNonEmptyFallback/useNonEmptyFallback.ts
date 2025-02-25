import { isEmpty } from 'lodash';
import { useEffect, useRef } from 'react';

export const useNonEmptyFallback = <T>(value: T): T => {
  const lastNonEmptyRef = useRef<T>();

  useEffect(() => {
    if (isEmpty(value)) return;
    lastNonEmptyRef.current = value;
  }, [value]);

  return isEmpty(value) ? lastNonEmptyRef.current ?? value : value;
};
