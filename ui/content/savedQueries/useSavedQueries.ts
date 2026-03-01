import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { assert } from 'ts-essentials';
import type { Chart, SavedQuery } from '@/savedQueries/types';
import { AnalyticsContext } from '../analytics/Context';
import { ToastContext } from '../toast/Context';
import { QueriesContext } from '../tabs/queries/Context';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { v4 as uuid } from 'uuid';
import { demoConnectionId } from '../connections/demo/constants';
import { demoSavedQueries } from '../connections/demo/savedQueries';
import { TabsContext } from '../tabs/Context';
import { getNewQuery } from '../tabs/queries/utils/getNewQuery';

export const useSavedQueries = () => {
  const activeConnectionContext = useContext(ActiveConnectionContext);
  const activeConnection = activeConnectionContext?.activeConnection;
  const { track } = useDefinedContext(AnalyticsContext);
  const { addTab } = useDefinedContext(TabsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const toast = useDefinedContext(ToastContext);

  const getStorageKey = () => {
    if (!activeConnectionContext) return null;

    const {
      activeConnection: { id, engine, database },
    } = activeConnectionContext;

    return `savedQueries.${id}${engine === 'postgres' ? `.${database}` : ''}`;
  };

  const [
    localSavedQueries,
    setLocalSavedQueries,
    { isInitialized: isLocalSavedQueriesInitialized },
  ] = useStoredState<SavedQuery[]>(getStorageKey(), []);

  useEffect(() => {
    if (
      activeConnection?.id === demoConnectionId &&
      localSavedQueries.length === 0 &&
      isLocalSavedQueriesInitialized
    ) {
      setLocalSavedQueries(demoSavedQueries);
      void getNewQuery({
        addQueryOptions: demoSavedQueries[0],
        connection: activeConnection,
      }).then((q) => addTab([[q]]));
    }
  }, [
    activeConnection,
    addTab,
    isLocalSavedQueriesInitialized,
    localSavedQueries,
    setLocalSavedQueries,
  ]);

  const savedQueries = localSavedQueries;

  const refetchSavedQueries = useCallback(async () => {}, []);

  const deleteSavedQuery = useCallback(
    async (savedQuery: SavedQuery, queryId: string, onSuccess?: () => void) => {
      assert(activeConnectionContext);

      track('saved_query_delete');

      setLocalSavedQueries((sqs) => sqs.filter((sq) => sq.id !== savedQuery.id));

      await updateQuery({ id: queryId, savedQueryId: null });

      toast.add({
        color: 'success',
        title: 'Saved query deleted',
      });

      void onSuccess?.();
    },
    [activeConnectionContext, track, updateQuery, toast, setLocalSavedQueries],
  );

  const createSavedQuery = useCallback(
    async (
      data: { name: string; sql: string; chart?: Chart },
      queryId: string,
      onSuccess?: () => void,
    ) => {
      assert(activeConnectionContext);

      const { name, sql, chart } = data;

      track('saved_query_create');

      try {
        const id = uuid();
        setLocalSavedQueries((sqs) => [...sqs, { id, name, sql, chart }]);

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
    [activeConnectionContext, track, toast, updateQuery, setLocalSavedQueries],
  );

  const updateSavedQuery = useCallback(
    async (
      id: string,
      data: { name?: string; sql?: string; chart?: Chart | null },
      queryId: string,
      onSuccess?: () => void,
    ) => {
      assert(activeConnectionContext);

      track('saved_query_update');

      const { name, sql, chart } = data;

      try {
        setLocalSavedQueries((currentSavedQueries) =>
          currentSavedQueries.map((sq) => {
            if (sq.id !== id) return sq;
            const updated = { ...sq };
            if (name !== undefined) updated.name = name;
            if (sql !== undefined) updated.sql = sql;
            if (chart !== undefined) updated.chart = chart;
            return updated;
          }),
        );

        if (sql !== undefined || chart !== undefined) {
          await updateQuery({ id: queryId, savedQueryId: id, sql, chart });
        }

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
    [activeConnectionContext, track, toast, setLocalSavedQueries, updateQuery],
  );

  return useMemo(
    () => ({
      createSavedQuery,
      deleteSavedQuery,
      isLoading: false,
      refetchSavedQueries,
      savedQueries,
      updateSavedQuery,
    }),
    [
      createSavedQuery,
      deleteSavedQuery,
      refetchSavedQueries,
      savedQueries,
      updateSavedQuery,
    ],
  );
};
