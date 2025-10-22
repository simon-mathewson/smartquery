import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { ToastContext } from '~/content/toast/Context';
import { getErrorMessage } from '~/shared/components/sqlEditor/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Row, TableType } from '~/shared/types';
import { type Query, type QueryResult } from '~/shared/types';
import { TabsContext } from '../Context';
import type { AddQueryOptions } from './types';
import { getColumnsFromResult, getColumnsStatements } from './utils/columns';
import { convertDbValue } from './utils/convertDbValue';
import { getNewQuery } from './utils/getNewQuery';
import { getTableStatements } from './utils/getTableStatement';
import { getTotalRowsStatement } from './utils/getTotalRowsStatement';
import { parseQuery } from './utils/parse';
import type { Chart } from '@/savedQueries/types';
import { chunk, sortBy, uniqBy } from 'lodash';
import { getVirtualColumns } from './utils/getVirtualColumns';

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

      const columnsStatements = getColumnsStatements({
        connection: activeConnection,
        select,
      });

      const totalRowsStatement = await getTotalRowsStatement({
        connection: activeConnection,
        select,
      });

      const tableStatements = getTableStatements({
        connection: activeConnection,
        select,
      });

      const statementsWithMetadata = [selectStatement, ...columnsStatements, ...tableStatements];

      if (totalRowsStatement) {
        statementsWithMetadata.push(totalRowsStatement);
      }

      onStartLoading(id);

      try {
        const results = await runQuery(statementsWithMetadata, { skipSqliteWrite: true });

        const firstSelectResult = results[0];
        const columnsResults = results.slice(1, columnsStatements.length + 1);
        const tableResults = results.slice(
          columnsStatements.length + 1,
          columnsStatements.length + tableStatements.length + 1,
        );
        const totalRowsResult = totalRowsStatement ? results[results.length - 1] : null;

        const columnsWithDuplicates = chunk(columnsResults, 2).flatMap(
          ([columnsResult, constraintsResult], index) =>
            getColumnsFromResult({
              connection: activeConnection,
              parsedStatement: select!.parsed,
              columnsResult,
              constraintsResult,
              table: select.tables[index],
            }),
        );

        // If there are multiple columns with the same name, we only keep the first.
        // This can happen if all columns of multiple tables are selected.
        // Prefer visible columns.
        const tableColumns = uniqBy(
          sortBy(columnsWithDuplicates, (column) => (column.isVisible ? 0 : 1)),
          'name',
        );
        const virtualColumns = getVirtualColumns(
          firstSelectResult,
          tableColumns.map((column) => column.name),
        );
        const columns = [...tableColumns, ...virtualColumns];

        const rows = firstSelectResult.map<Row>((row) =>
          Object.fromEntries(
            Object.entries(row).map(([columnName, value]) => {
              const column = columns.find((column) => column.name === columnName);
              return [columnName, convertDbValue(value, column?.dataType)];
            }),
          ),
        );

        const totalRows = Number(totalRowsResult?.[0].count);

        const tables = select.tables.map(({ name, originalName }, index) => ({
          name,
          originalName,
          type: (tableResults[index].at(0)?.table_type ?? 'SYSTEM_VIEW') as TableType,
        }));

        setQueryResults((currentQueryResults) => ({
          ...currentQueryResults,
          [query.id]: {
            columns,
            rows,
            schema: activeConnection.engine === 'postgres' ? select!.schema : undefined,
            tables,
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

        const columns = rawRows ? getVirtualColumns(rawRows) : [];

        if (rows) {
          setQueryResults((currentQueryResults) => ({
            ...currentQueryResults,
            [query.id]: {
              columns,
              rows,
              tables: [],
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
