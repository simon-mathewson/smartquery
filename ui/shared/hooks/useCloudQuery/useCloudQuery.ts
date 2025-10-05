import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCloudQuery = <T>(query: () => Promise<T>, options?: { disabled?: boolean }) => {
  const [results, setResults] = useState<T | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const run = useCallback(async () => {
    if (options?.disabled) {
      setResults(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await query();
      setResults(response);
    } finally {
      setIsLoading(false);
      setHasRun(true);
    }
  }, [options, query]);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.disabled]);

  return useMemo(
    () =>
      ({
        hasRun,
        isLoading,
        results,
        run,
      }) as const,
    [results, run, isLoading, hasRun],
  );
};
