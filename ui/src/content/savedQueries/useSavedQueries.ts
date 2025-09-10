import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import { useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { sqliteDemoConnectionId } from '../connections/constants';

export const useSavedQueries = () => {
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);

  const {
    hasRun,
    results: savedQueries,
    run: refetchSavedQueries,
  } = useCloudQuery(
    () => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      if (activeConnection.id === sqliteDemoConnectionId) {
        return Promise.resolve([]);
      }

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
      refetchSavedQueries,
    }),
    [isLoading, savedQueries, refetchSavedQueries],
  );
};
