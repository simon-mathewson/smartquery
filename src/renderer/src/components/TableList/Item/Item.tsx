import { ListItem } from '@renderer/components/shared/ListItem/ListItem';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { useDrag } from '@renderer/hooks/useDrag/useDrag';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import React from 'react';

export type ItemProps = { tableName: string };

export const Item: React.FC<ItemProps> = (props) => {
  const { tableName } = props;

  const { setQueryGroups } = useDefinedContext(GlobalContext);

  const getQuery = () => ({
    id: uniqueId(),
    label: tableName,
    sql: `SELECT * FROM "${tableName}" LIMIT 50`,
  });

  const { handleMouseDown, isDragging } = useDrag({ query: getQuery() });

  return (
    <ListItem
      className={classNames({ '!opacity-50': isDragging })}
      key={tableName}
      label={tableName}
      onClick={() => setQueryGroups([[[getQuery()]]])}
      onMouseDown={handleMouseDown}
      selectedVariant="primary"
    />
  );
};
