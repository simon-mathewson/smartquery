import { useState, useEffect } from 'react';

export const useStoredState = <T>(
  key: string,
  defaultValue: T | (() => T),
  storage = localStorage,
) => {
  const getInitialValue = () => {
    const storedValue = storage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  };

  const [state, setState] = useState<T>(getInitialValue);

  useEffect(() => {
    storage.setItem(key, JSON.stringify(state));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setState(getInitialValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState] as const;
};
