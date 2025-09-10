import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import { useCallback, useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';
import { sqliteDemoConnectionId } from '../connections/constants';
import type { SavedQuery } from '@/savedQueries/types';
import { AnalyticsContext } from '../analytics/Context';
import { ToastContext } from '../toast/Context';
import { QueriesContext } from '../tabs/queries/Context';

export const useSavedQueries = () => {
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const toast = useDefinedContext(ToastContext);

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

  const deleteSavedQuery = useCallback(
    async (savedQuery: SavedQuery, queryId: string, onSuccess?: () => void) => {
      track('saved_query_delete');

      await cloudApi.savedQueries.delete.mutate(savedQuery.id);

      await refetchSavedQueries();
      await updateQuery({ id: queryId, savedQueryId: null });

      toast.add({
        color: 'success',
        title: 'Saved query deleted',
      });

      void onSuccess?.();
    },
    [track, cloudApi, updateQuery, refetchSavedQueries, toast],
  );

  const createSavedQuery = useCallback(
    async (data: { name: string; sql: string }, queryId: string, onSuccess?: () => void) => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      const { name, sql } = data;

      track('saved_query_create');

      try {
        const id = await cloudApi.savedQueries.create.mutate({
          connectionId: activeConnection.id,
          database: activeConnection.engine === 'postgres' ? activeConnection.database : null,
          name,
          sql,
        });

        await refetchSavedQueries();
        await updateQuery({ id: queryId, savedQueryId: id });

        toast.add({
          color: 'success',
          title: 'Query saved',
        });

        void onSuccess?.();
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Failed to create saved query',
        });
      }
    },
    [track, cloudApi, activeConnectionContext, refetchSavedQueries, updateQuery, toast],
  );

  const updateSavedQuery = useCallback(
    async (
      id: string,
      data: { name?: string; sql?: string },
      queryId: string,
      onSuccess?: () => void,
    ) => {
      track('saved_query_update');

      const { name, sql } = data;

      try {
        await cloudApi.savedQueries.update.mutate({ id, name, sql });

        if (sql !== undefined) {
          await updateQuery({ id: queryId, savedQueryId: id, sql });
        }

        await refetchSavedQueries();

        toast.add({
          color: 'success',
          title: 'Saved query updated',
        });

        onSuccess?.();
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Failed to update saved query',
        });
      }
    },
    [track, cloudApi, refetchSavedQueries, toast, updateQuery],
  );

  return useMemo(
    () => ({
      createSavedQuery,
      deleteSavedQuery,
      isLoading,
      refetchSavedQueries,
      savedQueries,
      updateSavedQuery,
    }),
    [
      createSavedQuery,
      deleteSavedQuery,
      isLoading,
      refetchSavedQueries,
      savedQueries,
      updateSavedQuery,
    ],
  );
};
