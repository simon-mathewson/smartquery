import { useState, useEffect } from 'react';

export const useLocalStorageState = <T>(key: string, defaultValue: T | (() => T)) => {
  const getInitialValue = () => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  };

  const [state, setState] = useState<T>(getInitialValue);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setState(getInitialValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState] as const;
};
