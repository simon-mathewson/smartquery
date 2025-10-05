import { useState, useEffect } from 'react';
import superjson from 'superjson';

export const useStoredState = <T>(
  key: string | null,
  defaultValue: T | (() => T),
  storage = localStorage,
  migrations: Array<(storedValue: T) => T> = [],
) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const getDefaultValue = () =>
    typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;

  const getInitialValue = () => {
    if (key === null) return getDefaultValue();

    setIsInitialized(true);

    const storedValue = storage.getItem(key);
    if (storedValue) {
      const parsedValue = superjson.parse<T>(storedValue);
      return migrations.reduce((value, migration) => migration(value), parsedValue);
    }

    return getDefaultValue();
  };

  const [state, setState] = useState<T>(getInitialValue);

  useEffect(() => {
    if (key === null) return;
    storage.setItem(key, superjson.stringify(state));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    setState(getInitialValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        const parsedValue = superjson.parse<T>(event.newValue);
        const migratedValue = migrations.reduce(
          (value, migration) => migration(value),
          parsedValue,
        );
        setState(migratedValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, migrations]);

  return [state, setState, { isInitialized }] as const;
};
