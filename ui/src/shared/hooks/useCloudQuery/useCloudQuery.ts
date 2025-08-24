import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCloudQuery = <T>(query: () => Promise<T>, options?: { disabled?: boolean }) => {
  const [results, setResults] = useState<T | null>(null);

  const [hasRun, setHasRun] = useState(false);

  const run = useCallback(async () => {
    if (options?.disabled) {
      setResults(null);
      return;
    }

    const response = await query();
    setResults(response);

    setHasRun(true);
  }, [options, query]);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.disabled]);

  return useMemo(
    () =>
      ({
        hasRun,
        results,
        run,
      }) as const,
    [results, run, hasRun],
  );
};
