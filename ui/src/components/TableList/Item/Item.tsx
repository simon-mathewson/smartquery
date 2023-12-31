import { ListItem } from '~/components/shared/ListItem/ListItem';
import { GlobalContext } from '~/contexts/GlobalContext';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import { useDrag } from '~/hooks/useDrag/useDrag';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import React from 'react';

export type ItemProps = { tableName: string };

export const Item: React.FC<ItemProps> = (props) => {
  const { tableName } = props;

  const { connections, selectedConnectionIndex, setQueries } = useDefinedContext(GlobalContext);

  const connection = selectedConnectionIndex !== null ? connections[selectedConnectionIndex] : null;

  const getQuery = () => {
    if (!connection) {
      throw new Error('Not connected');
    }

    return {
      id: uniqueId(),
      label: tableName,
      sql: {
        mysql: `SELECT * FROM ${tableName} LIMIT 50`,
        postgresql: `SELECT * FROM "${tableName}" LIMIT 50`,
        sqlserver: `SELECT TOP 50 * FROM ${tableName}`,
      }[connection.engine],
    };
  };

  const { handleMouseDown, isDragging } = useDrag({ query: getQuery() });

  return (
    <ListItem
      className={classNames({ '!opacity-50': isDragging })}
      key={tableName}
      label={tableName}
      onClick={() => setQueries([[getQuery()]])}
      onMouseDown={handleMouseDown}
      selectedVariant="primary"
    />
  );
};
