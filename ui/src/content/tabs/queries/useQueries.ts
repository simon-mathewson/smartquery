import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '~/content/connections/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Row } from '~/shared/types';
import { type Query, type QueryResult } from '~/shared/types';
import { isNotNull } from '~/shared/utils/typescript/typescript';
import { TabsContext } from '../Context';
import type { AddQueryOptions } from './types';
import {
  convertPrismaValue,
  getColumnsFromResult,
  getColumnsStatement,
  getNewQuery,
  getTotalRowsStatement,
  parseQuery,
} from './utils';
import { TrpcContext } from '~/content/trpc/Context';

export const useQueries = () => {
  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);

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

  const runSelectQuery = useCallback(
    async (id: string) => {
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const query = queriesRef.current.find((q) => q.id === id);
      assert(query);

      const { select, statements } = query;
      assert(select);
      assert(statements?.length === 1);

      const selectStatement = statements[0];

      const columnsStatement = getColumnsStatement({
        connection: activeConnection,
        table: select.table,
      });

      const totalRowsStatement = getTotalRowsStatement({
        connection: activeConnection,
        select,
      });

      const statementsWithMetadata = [selectStatement, columnsStatement, totalRowsStatement].filter(
        isNotNull,
      );

      onStartLoading(id);

      try {
        const results = await trpc.sendQuery.mutate({
          clientId: activeConnection.clientId,
          statements: statementsWithMetadata,
        });

        const [firstSelectResult, columnsResult, totalRowsResult] = results;

        const columns = getColumnsFromResult({
          connection: activeConnection,
          parsedStatement: select!.parsed,
          result: columnsResult,
        });

        const rows = firstSelectResult.map<Row>((row) =>
          Object.fromEntries(
            Object.entries(row).map(([columnName, value]) => {
              const column = columns.find((column) => column.name === columnName);
              return [columnName, convertPrismaValue(value, column?.dataType)];
            }),
          ),
        );

        const totalRows = Number(totalRowsResult[0].count);

        setQueryResults((currentQueryResults) => ({
          ...currentQueryResults,
          [query.id]: {
            columns,
            rows,
            table: select!.table,
            totalRows,
          },
        }));
      } finally {
        onFinishLoading(id);
      }
    },
    [activeConnection, onFinishLoading, onStartLoading, trpc],
  );

  const runQuery = useCallback(
    async (id: string) => {
      if (!activeConnection) {
        throw new Error('No active connection');
      }

      const query = queriesRef.current.find((q) => q.id === id);
      assert(query);

      const { select, statements } = query;

      if (!statements) return;

      const { clientId } = activeConnection;

      if (select && statements.length === 1) {
        return runSelectQuery(id);
      }

      onStartLoading(id);

      try {
        const results = await trpc.sendQuery.mutate({ clientId, statements });

        const rawRows = results.find((result) => result.length) ?? null;
        const rows = rawRows
          ? rawRows.map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key, convertPrismaValue(value)]),
              ),
            )
          : null;

        if (rows) {
          setQueryResults((currentQueryResults) => ({
            ...currentQueryResults,
            [query.id]: {
              columns: null,
              rows,
            },
          }));
        } else {
          setQueryResults((currentQueryResults) => {
            const newQueryResults = { ...currentQueryResults };
            delete newQueryResults[query.id];
            return newQueryResults;
          });
        }
      } finally {
        onFinishLoading(id);
      }
    },
    [activeConnection, onFinishLoading, onStartLoading, runSelectQuery, trpc],
  );

  const addQuery = useCallback(
    (
      query: AddQueryOptions,
      options?: {
        position?: { column: number; row?: number };
        tabId?: string;
      },
    ) => {
      const { position, tabId } = options ?? {};

      assert(activeConnection);

      const newQuery = getNewQuery({ addQueryOptions: query, engine: activeConnection.engine });

      if (!tabId) {
        addTab([[newQuery]]);
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

      setTimeout(() => {
        void runQuery(newQuery.id);
      });
    },
    [activeConnection, addTab, runQuery, setQueries],
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
                  sql: sql.trim(),
                  ...parseQuery({ engine: activeConnection.engine, sql }),
                }
              : q,
          ),
        ),
      );

      if (run) {
        return new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve(runQuery(id));
          }),
        );
      }
    },
    [activeConnection, runQuery, setQueries],
  );

  const refetchActiveTabSelectQueries = useCallback(() => {
    if (!activeTab) return;

    activeTab.queries.flat().forEach((query) => {
      if (query.select) {
        runQuery(query.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.id, runQuery]);

  // Refetch select queries when active tab changes
  useEffect(() => {
    if (!activeConnection) return;
    refetchActiveTabSelectQueries();
  }, [activeConnection, refetchActiveTabSelectQueries]);

  return useMemo(
    () => ({
      addQuery,
      queryResults,
      refetchActiveTabSelectQueries,
      removeQuery,
      runQuery,
      updateQuery,
    }),
    [addQuery, queryResults, refetchActiveTabSelectQueries, removeQuery, runQuery, updateQuery],
  );
};
