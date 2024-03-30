import * as uuid from 'uuid';
import { castArray } from 'lodash';
import NodeSqlParser from 'node-sql-parser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Row } from '~/shared/types';
import { type Query, type QueryResult, type Tab } from '~/shared/types';
import type { AddQueryOptions } from './types';
import {
  convertPrismaValue,
  getColumnsFromResult,
  getColumnsStatement,
  getNewQuery,
} from './utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { trpc } from '~/trpc';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { getParserOptions } from './Queries/Query/utils';
import { isNotNull } from '~/shared/utils/typescript';
import { parseStatements } from '~/shared/utils/sql';

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

  const setQueries = useCallback(
    (updateFn: (queries: Query[][]) => Query[][], tabId?: string) => {
      setTabs((currentTabs) =>
        currentTabs.map((t) =>
          t.id === (tabId ?? activeTab?.id) ? { ...t, queries: updateFn(t.queries) } : t,
        ),
      );
    },
    [setTabs, activeTab],
  );

  const runQuery = useCallback(
    async (query: Query) => {
      if (!query?.sql || !activeConnection) return;

      const { clientId } = activeConnection;

      const userStatements = parseStatements(query.sql);

      console.info('Query statements', userStatements);

      const sqlParser = new NodeSqlParser.Parser();

      const firstSelectStatement = userStatements.reduce<{
        index: number;
        parsed: NodeSqlParser.Select;
        table: string;
      } | null>((first, statement, index) => {
        if (first) return first;

        const parsed = castArray(
          sqlParser.astify(statement, getParserOptions(activeConnection.engine)),
        )[0];

        if (
          parsed.type !== 'select' ||
          parsed.from?.length !== 1 ||
          parsed.columns.some((column) => column.expr.type !== 'column_ref')
        ) {
          return null;
        }

        const table = parsed.from[0].table;
        if (!table) return null;

        return { index, parsed, table };
      }, null);

      console.info('First select statement', firstSelectStatement);

      const columnsStatement = firstSelectStatement
        ? getColumnsStatement({
            connection: activeConnection,
            table: firstSelectStatement.table,
          })
        : null;

      const statements = [...userStatements, columnsStatement].filter(isNotNull);

      const results = await trpc.sendQuery.mutate({ clientId, statements });

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
          [query.id]: { columns, rows },
        }));
      } else {
        setQueryResults((currentQueryResults) => {
          const newQueryResults = { ...currentQueryResults };
          delete newQueryResults[query.id];
          return newQueryResults;
        });
      }

      setQueries((currentQueries) =>
        currentQueries.map((column) =>
          column.map((q) =>
            q.id === query.id
              ? {
                  ...q,
                  table: firstSelectStatement?.table ?? null,
                }
              : q,
          ),
        ),
      );
    },
    [activeConnection, setQueries],
  );

  const addQuery = useCallback(
    async (
      addQueryOptions: AddQueryOptions,
      position?: { column: number; row?: number },
      tabId?: string,
    ) => {
      const newQuery = getNewQuery(addQueryOptions);

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

      await runQuery(newQuery);
    },
    [runQuery, setQueries],
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
    async (id: string, sql: string) => {
      let query!: Query;

      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => {
            if (q.id === id) {
              query = { ...q, sql };
              return query;
            }
            return q;
          }),
        ),
      );

      await runQuery(query);
    },
    [runQuery, setQueries],
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
            runQuery(query);
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
