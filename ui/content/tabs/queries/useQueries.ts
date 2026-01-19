import type { Chart } from '@/savedQueries/types';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { ToastContext } from '~/content/toast/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { type Query, type QueryResult } from '~/shared/types';
import { TabsContext } from '../Context';
import type { AddQueryOptions } from './types';
import { getNewQuery } from './utils/getNewQuery';
import { parseQuery } from './utils/parse';

export const useQueries = () => {
  const toast = useDefinedContext(ToastContext);

  const activeConnectionContext = useContext(ActiveConnectionContext);

  const { activeTab, addTab, setTabs, tabs } = useDefinedContext(TabsContext);

  const [queryResults, setQueryResults] = useState<Record<string, QueryResult>>({});

  const queriesRef = useRef<Query[]>([]);
  queriesRef.current = tabs.flatMap((t) => t.queries).flat();

  const setQueries = useCallback(
    (updateFn: (queries: Query[][]) => Query[][], tabId?: string) => {
      setTabs((currentTabs) => {
        const newTabs = currentTabs.map((t) =>
          t.id === (tabId ?? activeTab?.id) ? { ...t, queries: updateFn(t.queries) } : t,
        );

        return newTabs;
      });
    },
    [setTabs, activeTab?.id],
  );

  const onStartLoading = useCallback(
    (id: string) => {
      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => (q.id === id ? { ...q, isLoading: true } : q)),
        ),
      );
    },
    [setQueries],
  );

  const onFinishLoading = useCallback(
    (id: string) => {
      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => (q.id === id ? { ...q, isLoading: false } : q)),
        ),
      );
    },
    [setQueries],
  );

  const runUserQuery = useCallback(
    async (id: string) => {
      if (!activeConnectionContext) {
        throw new Error('No active connection');
      }
      const { runUserQuery } = activeConnectionContext;

      const query = queriesRef.current.find((q) => q.id === id);
      assert(query);

      if (!query.statements) return;

      onStartLoading(id);

      try {
        const result = await runUserQuery(query);

        if (result) {
          setQueryResults((currentQueryResults) => ({
            ...currentQueryResults,
            [query.id]: result,
          }));
        } else {
          setQueryResults((currentQueryResults) => {
            const newQueryResults = { ...currentQueryResults };
            delete newQueryResults[query.id];
            return newQueryResults;
          });

          toast.add({
            color: 'success',
            description: 'No results returned',
            title: 'Query successful',
          });
        }
      } catch (error) {
        setQueryResults((currentQueryResults) => ({
          ...currentQueryResults,
          [query.id]: { error: error instanceof Error ? error.message : String(error) },
        }));
      } finally {
        onFinishLoading(id);
      }
    },
    [activeConnectionContext, onFinishLoading, onStartLoading, toast],
  );

  const addQuery = useCallback(
    async (
      query: AddQueryOptions,
      options?: {
        afterActiveTab?: boolean;
        /** Auto-run even if non-select query */
        alwaysRun?: boolean;
        openIfExists?: boolean;
        position?: { column: number; row?: number };
        tabId?: string;
      },
    ) => {
      const { position, tabId, afterActiveTab, alwaysRun, openIfExists } = options ?? {};

      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      const newQuery = await getNewQuery({
        addQueryOptions: query,
        connection: activeConnection,
      });

      if (!tabId) {
        addTab([[newQuery]], { afterActive: afterActiveTab, openIfExists });
      } else {
        setQueries((currentQueries) => {
          if (!position) {
            return [[newQuery]];
          }

          const { column, row } = position;

          const newQueries = currentQueries.map((column) => [...column]);

          if (!newQueries[column]) {
            newQueries[column] = [newQuery];
          } else {
            if (row !== undefined) {
              newQueries[column].splice(row, 0, newQuery);
            } else {
              newQueries.splice(column, 0, [newQuery]);
            }
          }

          return newQueries;
        }, tabId);
      }

      if (alwaysRun) {
        setTimeout(() => {
          void runUserQuery(newQuery.id);
        }, 100);
      }
    },
    [activeConnectionContext, addTab, runUserQuery, setQueries],
  );

  const removeQuery = useCallback(
    (id: string) => {
      setQueries((currentQueries) =>
        currentQueries.map((c) => c.filter((q) => q.id !== id)).filter((c) => c.length),
      );
      setTabs((currentTabs) => currentTabs.filter((t) => t.queries.length));
    },
    [setQueries, setTabs],
  );

  const updateQuery = useCallback(
    async (props: {
      id: string;
      run?: boolean;
      sql?: string;
      savedQueryId?: string | null;
      chart?: Chart | null;
    }) => {
      const { id, run, sql, savedQueryId, chart } = props;

      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      const existingQuery = queriesRef.current.find((q) => q.id === id);
      assert(existingQuery);

      const updatedQuery = { ...existingQuery };

      if (sql !== undefined) {
        Object.assign(updatedQuery, {
          sql: sql.trim(),
          ...(await parseQuery({ connection: activeConnection, sql })),
        });
      }

      if (savedQueryId !== undefined) {
        Object.assign(updatedQuery, { savedQueryId });
      }

      if (chart !== undefined) {
        Object.assign(updatedQuery, { chart });
      }

      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => (q.id === id ? { ...q, ...updatedQuery } : q)),
        ),
      );

      if (run) {
        return new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve(runUserQuery(id));
          }),
        );
      }
    },
    [activeConnectionContext, runUserQuery, setQueries],
  );

  const refetchActiveTabSelectQueries = useCallback(() => {
    if (!activeTab) return;

    activeTab.queries.flat().forEach((query) => {
      if (query.select) {
        void runUserQuery(query.id);
      }
    });
  }, [activeTab, runUserQuery]);

  // Refetch select queries when active tab changes
  useEffect(() => {
    if (!activeConnectionContext) return;
    refetchActiveTabSelectQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.id]);

  return useMemo(
    () => ({
      addQuery,
      queryResults,
      refetchActiveTabSelectQueries,
      removeQuery,
      runUserQuery,
      updateQuery,
    }),
    [addQuery, queryResults, refetchActiveTabSelectQueries, removeQuery, runUserQuery, updateQuery],
  );
};
