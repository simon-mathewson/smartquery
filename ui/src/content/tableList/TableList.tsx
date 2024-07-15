import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { ConnectionsContext } from '../connections/Context';
import { TrpcContext } from '../trpc/Context';
import { TabsContext } from '../tabs/Context';
import { QueriesContext } from '../tabs/queries/Context';
import { useDrag } from '../dragAndDrop/useDrag/useDrag';
import { withQuotes } from '~/shared/utils/sql';
import { assert } from 'ts-essentials';
import classNames from 'classnames';
import { List } from '~/shared/components/list/List';

export const TableList: React.FC = () => {
  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { activeTab } = useDefinedContext(TabsContext);
  const { addQuery, queryResults } = useDefinedContext(QueriesContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (!activeConnection) return;

    const { clientId, database, engine } = activeConnection;

    const tableNamesStatement = {
      mysql: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema = '${database}'
        ORDER BY t ASC`,
      postgresql: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_catalog = '${database}'
        ORDER BY t ASC`,
    }[engine];

    trpc.sendQuery.mutate({ clientId, statements: [tableNamesStatement] }).then(([rows]) => {
      setTables(rows.map(({ t }) => String(t)));
    });
  }, [activeConnection, trpc]);

  const getIsSelected = (tableName: string) =>
    activeTab?.queries.some((query) =>
      query.some((q) => {
        const result = q.id in queryResults ? queryResults[q.id] : null;
        return result?.table === tableName;
      }),
    );

  const getQuery = (tableName: string) => {
    assert(activeConnection);

    return {
      sql: {
        mysql: `SELECT * FROM ${withQuotes(activeConnection.engine, tableName)} LIMIT 50`,
        postgresql: `SELECT * FROM ${withQuotes(activeConnection.engine, tableName)} LIMIT 50`,
      }[activeConnection.engine],
    };
  };

  const { getHandleMouseDown, isDragging } = useDrag({
    onDrop: (dropProps) => {
      const {
        itemId: tableName,
        dropMarker: { column, horizontal, row },
      } = dropProps;

      assert(activeTab);

      addQuery(getQuery(tableName), {
        position: { column, row: horizontal ? row : undefined },
        tabId: activeTab.id,
      });
    },
  });

  return (
    <div className="flex w-full flex-col gap-1 overflow-auto py-2">
      <List
        emptyPlaceholder="This database is empty."
        items={tables.map((tableName) => ({
          className: classNames({
            '!opacity-50': isDragging,
          }),
          label: tableName,
          onMouseDown: getHandleMouseDown(tableName),
          onSelect: () => addQuery(getQuery(tableName)),
          selected: getIsSelected(tableName),
          selectedVariant: 'secondary',
        }))}
      />
    </div>
  );
};
