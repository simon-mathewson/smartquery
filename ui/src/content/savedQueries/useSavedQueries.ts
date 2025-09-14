import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import { useCallback, useContext, useMemo } from 'react';
import { assert } from 'ts-essentials';
import type { SavedQuery } from '@/savedQueries/types';
import { AnalyticsContext } from '../analytics/Context';
import { ToastContext } from '../toast/Context';
import { QueriesContext } from '../tabs/queries/Context';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { v4 as uuid } from 'uuid';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { demoConnectionId } from '../connections/demo/constants';

export const useSavedQueries = () => {
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);
  const activeConnection = activeConnectionContext?.activeConnection;
  const { track } = useDefinedContext(AnalyticsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const toast = useDefinedContext(ToastContext);

  const getStorageKey = () => {
    if (!activeConnectionContext) return '';

    const {
      activeConnection: { id, engine, database },
    } = activeConnectionContext;

    return `savedQueries.${id}${engine === 'postgres' ? `.${database}` : ''}`;
  };

  const [localSavedQueries, setLocalSavedQueries] = useStoredState<SavedQuery[]>(
    getStorageKey(),
    [],
  );

  useEffectOnce(
    () => {
      if (activeConnection?.id === demoConnectionId && localSavedQueries.length === 0) {
        setLocalSavedQueries([
          {
            id: uuid(),
            name: 'Invoice totals per customer',
            sql: 'SELECT\n  T1.FirstName,\n  T1.LastName,\n  SUM(T2.Total) AS TotalInvoices\nFROM customers AS T1\nINNER JOIN invoices AS T2\n  ON T1.CustomerId = T2.CustomerId\nGROUP BY\n  T1.CustomerId\nORDER BY\n  T1.FirstName,\n  T1.LastName;',
          },
        ]);
      }
    },
    { enabled: Boolean(activeConnection) },
  );

  const {
    hasRun,
    results: cloudSavedQueries,
    run: refetchSavedQueries,
  } = useCloudQuery(
    () => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      if (activeConnection.storageLocation === 'local') {
        return Promise.resolve([]);
      }

      return cloudApi.savedQueries.list.query({
        connectionId: activeConnection.id,
        database: activeConnection.engine === 'postgres' ? activeConnection.database : null,
      });
    },
    { disabled: !activeConnectionContext },
  );

  const savedQueries = useMemo(
    () => [...localSavedQueries, ...(cloudSavedQueries ?? [])],
    [localSavedQueries, cloudSavedQueries],
  );

  const isLoading = !hasRun;

  const deleteSavedQuery = useCallback(
    async (savedQuery: SavedQuery, queryId: string, onSuccess?: () => void) => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      track('saved_query_delete');

      if (activeConnection.storageLocation === 'cloud') {
        await cloudApi.savedQueries.delete.mutate(savedQuery.id);
        await refetchSavedQueries();
      } else {
        setLocalSavedQueries(localSavedQueries.filter((sq) => sq.id !== savedQuery.id));
      }

      await updateQuery({ id: queryId, savedQueryId: null });

      toast.add({
        color: 'success',
        title: 'Saved query deleted',
      });

      void onSuccess?.();
    },
    [
      activeConnectionContext,
      track,
      updateQuery,
      toast,
      cloudApi,
      refetchSavedQueries,
      setLocalSavedQueries,
      localSavedQueries,
    ],
  );

  const createSavedQuery = useCallback(
    async (data: { name: string; sql: string }, queryId: string, onSuccess?: () => void) => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      const { name, sql } = data;

      track('saved_query_create');

      try {
        if (activeConnection.storageLocation === 'cloud') {
          const id = await cloudApi.savedQueries.create.mutate({
            connectionId: activeConnection.id,
            database: activeConnection.engine === 'postgres' ? activeConnection.database : null,
            name,
            sql,
          });

          await refetchSavedQueries();
          await updateQuery({ id: queryId, savedQueryId: id });
        } else {
          const id = uuid();
          setLocalSavedQueries([...localSavedQueries, { id, name, sql }]);

          await updateQuery({ id: queryId, savedQueryId: id });
        }

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
    [
      activeConnectionContext,
      track,
      toast,
      cloudApi,
      refetchSavedQueries,
      updateQuery,
      setLocalSavedQueries,
      localSavedQueries,
    ],
  );

  const updateSavedQuery = useCallback(
    async (
      id: string,
      data: { name?: string; sql?: string },
      queryId: string,
      onSuccess?: () => void,
    ) => {
      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      track('saved_query_update');

      const { name, sql } = data;

      try {
        if (activeConnection.storageLocation === 'cloud') {
          await cloudApi.savedQueries.update.mutate({ id, name, sql });
        } else {
          setLocalSavedQueries((currentSavedQueries) =>
            currentSavedQueries.map((sq) => (sq.id === id ? Object.assign(sq, { name, sql }) : sq)),
          );
        }

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
    [
      activeConnectionContext,
      track,
      refetchSavedQueries,
      toast,
      cloudApi,
      setLocalSavedQueries,
      updateQuery,
    ],
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
