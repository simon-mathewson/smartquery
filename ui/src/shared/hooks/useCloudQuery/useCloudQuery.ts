import { useCallback, useMemo, useState } from 'react';
import { useEffectOnce } from '../useEffectOnce/useEffectOnce';

export const useCloudQuery = <T>(query: () => Promise<T>) => {
  const [response, setResponse] = useState<T | null>(null);

  useEffectOnce(() => {
    query().then(setResponse);
  });

  const refetch = useCallback(() => {
    query().then(setResponse);
  }, [query]);

  return useMemo(() => [response, refetch] as const, [response, refetch]);
};
