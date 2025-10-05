import type NodeSqlParser from 'node-sql-parser';
import type { Select } from '../../../types';
import { getColumnRefFromAst } from '../../../utils/columnRefs';

export const getSortedColumnFromAst = (select: Select) => {
  const orderByList = select.parsed.orderby;

  if (!orderByList || orderByList.length !== 1) return null;

  const [orderBy] = orderByList;

  const columnRef = getColumnRefFromAst(orderBy.expr as NodeSqlParser.ColumnRef);

  if (!columnRef) return null;

  return {
    ...columnRef,
    direction: orderBy.type,
  };
};
