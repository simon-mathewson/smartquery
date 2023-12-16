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

  const { setQueries } = useDefinedContext(GlobalContext);

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
      onClick={() => setQueries([[getQuery()]])}
      onMouseDown={handleMouseDown}
      selectedVariant="primary"
    />
  );
};
