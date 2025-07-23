import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { ToastContext } from '~/content/toast/Context';
import { getErrorMessage } from '~/shared/components/sqlEditor/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Row, TableType } from '~/shared/types';
import { type Query, type QueryResult } from '~/shared/types';
import { isNotNull } from '~/shared/utils/typescript/typescript';
import { TabsContext } from '../Context';
import type { AddQueryOptions } from './types';
import { getColumnsFromResult, getColumnsStatement } from './utils/columns';
import { convertDbValue } from './utils/convertPrismaValue';
import { getNewQuery } from './utils/getNewQuery';
import { getTableStatement } from './utils/getTableStatement';
import { getTotalRowsStatement } from './utils/getTotalRowsStatement';
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

  const runUserSelectQuery = useCallback(
    async (id: string) => {
      assert(activeConnectionContext);
      const { activeConnection, runQuery } = activeConnectionContext;

      const query = queriesRef.current.find((q) => q.id === id);
      assert(query);

      const { select, statements } = query;
      assert(select);
      assert(statements?.length === 1);

      const selectStatement = statements[0];

      const [columnsStatement, constraintsStatement] = getColumnsStatement({
        connection: activeConnection,
        select,
      });

      const totalRowsStatement = await getTotalRowsStatement({
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
        const results = await runQuery(statementsWithMetadataFiltered, { skipSqliteWrite: true });

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
            schema: activeConnection.engine === 'postgres' ? select!.schema : undefined,
            table: select!.table,
            tableType,
            totalRows,
          },
        }));
      } finally {
        onFinishLoading(id);
      }
    },
    [activeConnectionContext, onFinishLoading, onStartLoading],
  );

  const runUserQuery = useCallback(
    async (id: string) => {
      if (!activeConnectionContext) {
        throw new Error('No active connection');
      }
      const { runQuery } = activeConnectionContext;

      const query = queriesRef.current.find((q) => q.id === id);
      assert(query);

      const { select, statements } = query;

      if (!statements) return;

      if (select && statements.length === 1) {
        return runUserSelectQuery(id);
      }

      onStartLoading(id);

      try {
        const results = await runQuery(statements);

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
          toast.add({
            color: 'success',
            description: 'No results returned',
            title: 'Query completed',
          });
        }
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          toast.add({
            color: 'danger',
            description: getErrorMessage(error),
            title: 'Query failed',
          });
        }

        throw error;
      } finally {
        onFinishLoading(id);
      }
    },
    [activeConnectionContext, onFinishLoading, onStartLoading, runUserSelectQuery, toast],
  );

  const addQuery = useCallback(
    async (
      query: AddQueryOptions,
      options?: {
        afterActiveTab?: boolean;
        openIfExists?: boolean;
        position?: { column: number; row?: number };
        run?: boolean;
        tabId?: string;
      },
    ) => {
      const { position, tabId, afterActiveTab, run, openIfExists } = options ?? {};

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

      if (run) {
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
    async (props: { id: string; run?: boolean; sql: string }) => {
      const { id, run, sql } = props;

      assert(activeConnectionContext);
      const { activeConnection } = activeConnectionContext;

      const updatedQuery = {
        sql: sql.trim(),
        ...(await parseQuery({ connection: activeConnection, sql })),
      };

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
