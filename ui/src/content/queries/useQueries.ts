import { uniqueId } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { Query, QueryToAdd } from './types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { trpc } from '~/main';

export const useQueries = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [queries, setQueries] = useState<Query[][]>([]);

  const runQuery = useCallback(
    (query: Query) => {
      if (!query?.sql || !activeConnection) return;

      const { clientId, database, engine } = activeConnection;

      const columnsQuery = query.table
        ? {
            mysql: `SELECT column_name AS c FROM information_schema.columns WHERE table_name = '${query.table}' AND table_schema = '${database}'`,
            postgresql: `SELECT column_name AS c FROM information_schema.columns WHERE table_name = '${query.table}' AND table_catalog = '${database}'`,
            sqlserver: `SELECT column_name AS c FROM information_schema.columns WHERE table_name = '${query.table}' AND table_catalog = '${database}'`,
          }[engine]
        : null;

      return Promise.all([
        trpc.sendQuery.query([clientId, query.sql]),
        columnsQuery ? trpc.sendQuery.query([clientId, columnsQuery]) : null,
      ]).then(([rows, rawColumns]) => {
        const columns = rawColumns?.map(({ c }) => c as string) ?? Object.keys(rows[0] ?? {});

        setQueries((currentQueries) =>
          currentQueries.map((currentColumn) =>
            currentColumn.map((q) =>
              q.id === query.id ? { ...q, columns, hasResults: true, rows } : q,
            ),
          ),
        );
      });
    },
    [activeConnection],
  );

  const addQuery = useCallback(
    async (query: QueryToAdd, position?: { column: number; row?: number }) => {
      const newQuery = {
        columns: [],
        hasResults: false,
        id: uniqueId(),
        rows: [],
        showEditor: query.showEditor === true,
        sql: query.sql ?? null,
        table: query.table ?? null,
      } satisfies Query;

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
      });

      await runQuery(newQuery);
    },
    [runQuery],
  );

  const removeQuery = useCallback((id: string) => {
    setQueries((currentQueries) => currentQueries.map((c) => c.filter((q) => q.id !== id)));
  }, []);

  const updateQuery = useCallback(
    async (id: string, sql: string) => {
      let query!: Query;

      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => {
            if (q.id !== id) return q;
            query = { ...q, sql };
            return query;
          }),
        ),
      );

      await runQuery(query);
    },
    [runQuery],
  );

  return useMemo(
    () => ({ addQuery, queries, removeQuery, updateQuery }),
    [addQuery, queries, removeQuery, updateQuery],
  );
};
