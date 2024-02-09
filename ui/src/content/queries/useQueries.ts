import { uniq, uniqueId } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { Column, Query, QueryToAdd } from './types';
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

      const columnsQuery = (() => {
        if (!query.table) return null;

        const databaseColumn = engine === 'mysql' ? 'table_schema' : 'table_catalog';

        return `
          SELECT c.column_name as column_name, tc.constraint_type as constraint_type
          FROM information_schema.columns AS c
          LEFT JOIN information_schema.key_column_usage AS k
            ON k.column_name = c.column_name
            AND k.table_name = c.table_name
            AND k.${databaseColumn} = c.${databaseColumn}
          LEFT JOIN information_schema.table_constraints AS tc
            ON tc.constraint_name = k.constraint_name
            AND tc.table_name = k.table_name
            AND tc.${databaseColumn} = k.${databaseColumn}
          WHERE c.table_name = '${query.table}'
          AND c.${databaseColumn} = '${database}'
        `;
      })();

      return Promise.all([
        trpc.sendQuery.query([clientId, query.sql]),
        columnsQuery ? trpc.sendQuery.query([clientId, columnsQuery]) : null,
      ]).then(([rows, rawColumns]) => {
        const columns: Column[] = (() => {
          if (rawColumns) {
            const columnNames = uniq(rawColumns.map(({ column_name }) => column_name as string));

            return columnNames.map((name) => {
              return {
                isForeignKey: rawColumns.some(
                  ({ column_name, constraint_type }) =>
                    constraint_type === 'FOREIGN KEY' && column_name === name,
                ),
                isPrimaryKey: rawColumns.some(
                  ({ column_name, constraint_type }) =>
                    constraint_type === 'PRIMARY KEY' && column_name === name,
                ),
                name,
              };
            });
          }
          return Object.keys(rows[0] ?? {}).map((name) => ({ name }));
        })();

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
