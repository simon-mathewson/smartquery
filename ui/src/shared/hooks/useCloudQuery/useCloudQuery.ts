import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCloudQuery = <T>(
  query: () => Promise<T>,
  props: { disabled?: boolean; emptyValue?: T },
) => {
  const [results, setResults] = useState<T | null>(null);

  const [hasRun, setHasRun] = useState(false);

  const emptyValue = useMemo(() => props?.emptyValue ?? ([] as T), [props?.emptyValue]);

  const run = useCallback(async () => {
    if (props.disabled) {
      setResults(emptyValue);
      return;
    }

    const response = await query();
    setResults(response);

    setHasRun(true);
  }, [props, query, emptyValue]);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.disabled]);

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
