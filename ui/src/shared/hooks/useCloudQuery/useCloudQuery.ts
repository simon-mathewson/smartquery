import { useCallback, useEffect, useMemo, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCloudQuery = <T extends any[] | []>(
  query: () => Promise<T>,
  props: { disabled?: boolean; emptyValue?: T },
) => {
  const [response, setResponse] = useState<T | null>(null);

  const emptyValue = useMemo(() => props?.emptyValue ?? ([] as T), [props?.emptyValue]);

  useEffect(() => {
    if (props.disabled) {
      setResponse(emptyValue);
      return;
    }

    query().then(setResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.disabled]);

  const refetch = useCallback(async () => {
    if (props.disabled) {
      setResponse(emptyValue);
      return;
    }

    const response = await query();
    setResponse(response);
  }, [props.disabled, query, emptyValue]);

  return useMemo(() => [response, refetch] as const, [response, refetch]);
};
