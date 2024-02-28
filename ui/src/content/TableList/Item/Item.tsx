import { ListItem } from '~/shared/components/ListItem/ListItem';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { useDrag } from '~/content/dragAndDrop/useDrag/useDrag';
import classNames from 'classnames';
import React from 'react';
import type { AddQueryOptions } from '../../tabs/types';
import { ConnectionsContext } from '~/content/connections/Context';
import { withQuotes } from '~/shared/utils/sql';
import { TabsContext } from '~/content/tabs/Context';

export type ItemProps = { tableName: string };

export const Item: React.FC<ItemProps> = (props) => {
  const { tableName } = props;

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { activeTab, addTab } = useDefinedContext(TabsContext);

  const isSelected = activeTab?.queries.some((query) => query.some((q) => q.table === tableName));

  const getQuery = (): AddQueryOptions => {
    if (!activeConnection) return {};

    return {
      sql: {
        mysql: `SELECT * FROM ${withQuotes(activeConnection.engine, tableName)} LIMIT 50`,
        postgresql: `SELECT * FROM ${withQuotes(activeConnection.engine, tableName)} LIMIT 50`,
        sqlserver: `SELECT TOP 50 * FROM ${withQuotes(activeConnection.engine, tableName)}`,
      }[activeConnection.engine],
      table: tableName,
    };
  };

  const { handleMouseDown, isDragging } = useDrag({ query: getQuery() });

  return (
    <ListItem
      className={classNames({ '!opacity-50': isDragging })}
      key={tableName}
      label={tableName}
      onClick={() => addTab({ query: getQuery() })}
      onMouseDown={handleMouseDown}
      selected={isSelected}
      selectedVariant="secondary"
    />
  );
};
