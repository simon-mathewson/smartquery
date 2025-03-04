import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { ConnectionsContext } from '../connections/Context';
import { TrpcContext } from '../trpc/Context';
import { TabsContext } from '../tabs/Context';
import { QueriesContext } from '../tabs/queries/Context';
import { useDrag } from '../dragAndDrop/useDrag/useDrag';
import { addQuotes } from '~/shared/utils/sql/sql';
import { assert } from 'ts-essentials';
import classNames from 'classnames';
import { List } from '~/shared/components/list/List';
import { uniq } from 'lodash';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';

type Table = { name: string; schema: string | undefined };

export const TableList: React.FC = () => {
  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { activeTab } = useDefinedContext(TabsContext);
  const { addQuery, queryResults } = useDefinedContext(QueriesContext);

  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    if (!activeConnection) return;

    const { database, engine, type } = activeConnection;

    const tableNamesStatement = (() => {
      switch (engine) {
        case 'mysql':
          return `
            SELECT table_name AS t FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
            AND table_schema = '${database}'
            ORDER BY t ASC
          `;
        case 'postgresql':
          return `
            SELECT table_name AS t, table_schema AS s FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
            ${activeConnection.schema ? `AND table_schema = '${activeConnection.schema}'` : ''}
            AND table_catalog = '${database}'
            ORDER BY t ASC
          `;
        case 'sqlite':
          return `
            SELECT name AS t FROM sqlite_master
            WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
            ORDER BY t ASC
          `;
      }
    })();

    if (type === 'remote') {
      trpc.sendQuery
        .mutate({ clientId: activeConnection.clientId, statements: [tableNamesStatement] })
        .then(([rows]) => {
          setTables(
            rows.map(({ t, s }) => ({ name: String(t), schema: s ? String(s) : undefined })),
          );
        });
    } else {
      const [result] = activeConnection.sqliteDb.exec(tableNamesStatement);
      setTables(
        result.values.map(([tableName]) => ({
          name: String(tableName),
          schema: undefined,
        })),
      );
    }
  }, [activeConnection, trpc]);

  const selectedTables = uniq(
    activeTab?.queries.flatMap((query) =>
      query
        .map((q) => {
          const result = q.id in queryResults ? queryResults[q.id] : null;
          return result?.table ? { name: result.table, schema: result.schema } : undefined;
        })
        .filter(isNotUndefined),
    ),
  ) satisfies Table[];

  const getQuery = (table: Table) => {
    assert(activeConnection);

    switch (activeConnection.engine) {
      case 'mysql':
        return {
          sql: `SELECT * FROM ${table.name} LIMIT 50`,
        };
      case 'postgresql':
        return {
          sql: `SELECT * FROM ${
            activeConnection.schema ? '' : `${addQuotes(activeConnection.engine, table.schema!)}.`
          }${addQuotes(activeConnection.engine, table.name)} LIMIT 50`,
        };
      case 'sqlite':
        return {
          sql: `SELECT * FROM ${table.name} LIMIT 50`,
        };
    }
  };

  const { getHandleMouseDown, isDragging } = useDrag<Table>({
    onDrop: (dropProps) => {
      const {
        item: table,
        dropMarker: { column, horizontal, row },
      } = dropProps;

      assert(activeTab);

      addQuery(getQuery(table), {
        position: { column, row: horizontal ? row : undefined },
        tabId: activeTab.id,
      });
    },
  });

  return (
    <div className="flex w-full flex-col gap-1 overflow-auto py-2">
      <List<Table>
        emptyPlaceholder="This database is empty."
        items={tables.map((table) => ({
          className: classNames({
            '!opacity-50': isDragging,
          }),
          label: table.name,
          onMouseDown: getHandleMouseDown(table),
          selectedVariant: 'secondary',
          value: table,
        }))}
        multiple
        onSelect={(table) => addQuery(getQuery(table))}
        selectedValues={selectedTables}
      />
    </div>
  );
};
