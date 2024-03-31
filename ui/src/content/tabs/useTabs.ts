import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import * as uuid from 'uuid';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import type { Row } from '~/shared/types';
import { type Query, type QueryResult, type Tab } from '~/shared/types';
import { isNotNull } from '~/shared/utils/typescript';
import { trpc } from '~/trpc';
import { ConnectionsContext } from '../connections/Context';
import type { AddQueryOptions } from './types';
import {
  convertPrismaValue,
  getColumnsFromResult,
  getColumnsStatement,
  getNewQuery,
  parseQuery,
} from './utils';

export const useTabs = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const localStorageSuffix = activeConnection
    ? `${activeConnection.id}-${activeConnection.database}`
    : '';

  const [tabs, setTabs] = useStoredState<Tab[]>(`tabs-${localStorageSuffix}`, [], sessionStorage);

  const [activeTabId, setActiveTabId] = useStoredState<string | null>(
    `activeTabId-${localStorageSuffix}`,
    null,
    sessionStorage,
  );

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);

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

  const runQuery = useCallback(
    async (id: string) => {
      const query = queriesRef.current.find((q) => q.id === id);
      assert(query);

      const { firstSelectStatement, statements } = query;

      if (!statements || !activeConnection) return;

      const columnsStatement = firstSelectStatement
        ? getColumnsStatement({
            connection: activeConnection,
            table: firstSelectStatement.table,
          })
        : null;

      const statementsWithColumns = [...statements, columnsStatement].filter(isNotNull);

      const { clientId } = activeConnection;

      const results = await trpc.sendQuery.mutate({ clientId, statements: statementsWithColumns });

      const firstSelectResult = firstSelectStatement ? results[firstSelectStatement.index] : null;
      const columnsResult = columnsStatement ? results[results.length - 1] : null;

      const columns = columnsResult
        ? getColumnsFromResult({
            connection: activeConnection,
            parsedStatement: firstSelectStatement!.parsed,
            result: columnsResult,
          })
        : null;

      const rows =
        firstSelectResult && columns
          ? firstSelectResult.map<Row>((row) =>
              Object.fromEntries(
                Object.entries(row).map(([columnName, value]) => {
                  const column = columns.find(
                    (column) => (column.alias ?? column.name) === columnName,
                  );
                  return [columnName, convertPrismaValue(value, column?.dataType)];
                }),
              ),
            )
          : null;

      if (rows) {
        setQueryResults((currentQueryResults) => ({
          ...currentQueryResults,
          [query.id]: {
            columns,
            rows,
            table: firstSelectStatement!.table,
          },
        }));
      } else {
        setQueryResults((currentQueryResults) => {
          const newQueryResults = { ...currentQueryResults };
          delete newQueryResults[query.id];
          return newQueryResults;
        });
      }
    },
    [activeConnection],
  );

  const addQuery = useCallback(
    (
      addQueryOptions: AddQueryOptions,
      position?: { column: number; row?: number },
      tabId?: string,
    ) => {
      assert(activeConnection);

      const newQuery = getNewQuery({ addQueryOptions, engine: activeConnection.engine });

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

      setTimeout(() => {
        void runQuery(newQuery.id);
      });
    },
    [activeConnection, runQuery, setQueries],
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
    async (props: { id: string; run?: boolean; sql: string }) => {
      const { id, run, sql } = props;

      assert(activeConnection);

      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) =>
            q.id === id
              ? {
                  ...q,
                  sql,
                  ...parseQuery({
                    engine: activeConnection.engine,
                    sql,
                  }),
                }
              : q,
          ),
        ),
      );

      if (run) {
        setTimeout(() => {
          void runQuery(id);
        });
      }
    },
    [activeConnection, runQuery, setQueries],
  );

  const addTab = useCallback(
    (props: { query: AddQueryOptions }) => {
      const id = uuid.v4();

      setTabs((currentTabs) => [...currentTabs, { id, queries: [] }]);
      setActiveTabId(id);

      setTimeout(() => {
        addQuery(props.query, { column: 0, row: 0 }, id);
      });
    },
    [addQuery, setActiveTabId, setTabs],
  );

  const removeTab = useCallback(
    (id: string) => {
      setTabs((currentTabs) => currentTabs.filter((t) => t.id !== id));
    },
    [setTabs],
  );

  useEffect(() => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) {
      setActiveTabId(null);
    }
    if (!activeTabId && tabs.length) {
      setActiveTabId(tabs[0].id);
    }
  }, [activeTabId, setActiveTabId, tabs]);

  useEffectOnce(
    () => {
      tabs.forEach((tab) => {
        tab.queries.flat().forEach((query) => {
          if (query.sql) {
            runQuery(query.id);
          }
        });
      });
    },
    { enabled: Boolean(tabs.length) },
  );

  return useMemo(
    () => ({
      activeTab,
      addQuery,
      addTab,
      queryResults,
      removeQuery,
      removeTab,
      runQuery,
      setActiveTabId,
      setTabs,
      tabs,
      updateQuery,
    }),
    [
      activeTab,
      addQuery,
      addTab,
      queryResults,
      removeQuery,
      removeTab,
      runQuery,
      setActiveTabId,
      setTabs,
      tabs,
      updateQuery,
    ],
  );
};
