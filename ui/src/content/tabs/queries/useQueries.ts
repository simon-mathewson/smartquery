import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '~/content/connections/Context';
import { TrpcContext } from '~/content/trpc/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { DbValue, Row, TableType } from '~/shared/types';
import { type Query, type QueryResult } from '~/shared/types';
import { isNotNull } from '~/shared/utils/typescript/typescript';
import { TabsContext } from '../Context';
import type { AddQueryOptions } from './types';
import { getColumnsFromResult, getColumnsStatement } from './utils/columns';
import { getTotalRowsStatement } from './utils/getTotalRowsStatement';
import { convertDbValue } from './utils/convertPrismaValue';
import { getNewQuery } from './utils/getNewQuery';
import { parseQuery } from './utils/parse';
import { getTableStatement } from './utils/getTableStatement';
import { convertSqliteResultsToRecords } from '~/shared/utils/sqlite/sqlite';

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

      const [columnsStatement, constraintsStatement] = getColumnsStatement({
        connection: activeConnection,
        select,
        table: select.table,
      });

      const totalRowsStatement = getTotalRowsStatement({
        connection: activeConnection,
        select,
      });

      const tableStatement = getTableStatement({
        connection: activeConnection,
        select,
        table: select.table,
      });

      const statementsWithMetadata = [
        selectStatement,
        columnsStatement,
        constraintsStatement,
        tableStatement,
        totalRowsStatement,
      ];

      const statementsWithMetadataFiltered = statementsWithMetadata.filter(isNotNull);

      onStartLoading(id);

      try {
        const results = (
          activeConnection.engine === 'sqlite'
            ? convertSqliteResultsToRecords(
                statementsWithMetadataFiltered.map(
                  (statement) => activeConnection.sqliteDb.exec(statement)[0],
                ),
              )
            : await trpc.sendQuery.mutate({
                clientId: activeConnection.clientId,
                statements: statementsWithMetadataFiltered,
              })
        ) as Record<string, DbValue>[][];

        const [firstSelectResult, columnsResult, constraintsResult, tableResult, totalRowsResult] =
          results;

        const columns = getColumnsFromResult({
          connection: activeConnection,
          parsedStatement: select!.parsed,
          columnsResult,
          constraintsResult,
        });

        const rows = firstSelectResult.map<Row>((row) =>
          Object.fromEntries(
            Object.entries(row).map(([columnName, value]) => {
              const column = columns.find((column) => column.name === columnName);
              return [columnName, convertDbValue(value, column?.dataType)];
            }),
          ),
        );

        const totalRows = Number(totalRowsResult?.[0].count);

        const tableType = (tableResult[0]?.table_type ?? 'SYSTEM_VIEW') as TableType;

        setQueryResults((currentQueryResults) => ({
          ...currentQueryResults,
          [query.id]: {
            columns,
            rows,
            schema: activeConnection.engine === 'postgresql' ? select!.schema : undefined,
            table: select!.table,
            tableType,
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

      if (select && statements.length === 1) {
        return runSelectQuery(id);
      }

      onStartLoading(id);

      try {
        const results = (
          activeConnection.engine === 'sqlite'
            ? convertSqliteResultsToRecords(
                statements.map((statement) => activeConnection.sqliteDb.exec(statement)[0]),
              )
            : await trpc.sendQuery.mutate({
                clientId: activeConnection.clientId,
                statements,
              })
        ) as Record<string, DbValue>[][];

        const rawRows = results.find((result) => result.length) ?? null;
        const rows = rawRows
          ? rawRows.map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key, convertDbValue(value)]),
              ),
            )
          : null;

        if (rows) {
          setQueryResults((currentQueryResults) => ({
            ...currentQueryResults,
            [query.id]: {
              columns: null,
              rows,
              tableType: null,
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
        afterActiveTab?: boolean;
      },
    ) => {
      const { position, tabId, afterActiveTab } = options ?? {};

      assert(activeConnection);

      const newQuery = getNewQuery({
        addQueryOptions: query,
        connection: activeConnection,
      });

      if (!tabId) {
        addTab([[newQuery]], afterActiveTab);
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
                  ...parseQuery({ connection: activeConnection, sql }),
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
