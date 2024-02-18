import { uniqueId } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { trpc } from '~/trpc';
import { ConnectionsContext } from '../connections/Context';
import type { Query, QueryToAdd } from './types';

export const useQueries = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [queries, setQueries] = useState<Query[][]>([]);

  const runQuery = useCallback(
    (query: Query) => {
      if (!query?.sql || !activeConnection) return;

      const { clientId } = activeConnection;

      return trpc.sendQuery.query([clientId, query.sql]).then(([{ columns, rows }]) => {
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
    setQueries((currentQueries) =>
      currentQueries.map((c) => c.filter((q) => q.id !== id)).filter((c) => c.length),
    );
  }, []);

  const updateQuery = useCallback(
    async (id: string, sql: string) => {
      let query!: Query;

      setQueries((currentQueries) =>
        currentQueries.map((currentColumn) =>
          currentColumn.map((q) => {
            if (q.id !== id) return q;
            query = { ...q, sql, table: null };
            return query;
          }),
        ),
      );

      await runQuery(query);
    },
    [runQuery],
  );

  return useMemo(
    () => ({ addQuery, queries, removeQuery, runQuery, updateQuery }),
    [addQuery, queries, removeQuery, runQuery, updateQuery],
  );
};
