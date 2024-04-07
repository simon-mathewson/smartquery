import type { Select } from '../../../types';

export const getSortedColumnFromAst = (select: Select) => {
  const orderByList = select.parsed.orderby;

  if (!orderByList || orderByList.length !== 1) return null;

  const [orderBy] = orderByList;

  return {
    columnName: 'column' in orderBy.expr ? orderBy.expr.column : orderBy.expr.value,
    direction: orderBy.type,
  };
};
