import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import { useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';

export const useSavedQueries = () => {
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);

  const { hasRun, results: savedQueries } = useCloudQuery(
    () => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      return cloudApi.savedQueries.list.query({
        connectionId: activeConnection.id,
        database: activeConnection.engine === 'postgres' ? activeConnection.database : null,
      });
    },
    { disabled: !activeConnectionContext },
  );

  const isLoading = !hasRun;

  return useMemo(
    () => ({
      isLoading,
      savedQueries,
    }),
    [isLoading, savedQueries],
  );
};
