import type NodeSqlParser from 'node-sql-parser';

export const getLimitAndOffset = (parsedQuery: NodeSqlParser.Select) => {
  if (
    !parsedQuery?.limit ||
    (parsedQuery.limit.seperator === 'offset' && parsedQuery.limit.value.length < 2)
  ) {
    return null;
  }

  const limitIndex = parsedQuery.limit.seperator === ',' ? 1 : 0;
  const offsetIndex = parsedQuery.limit.seperator === ',' ? 0 : 1;

  return {
    limit: parsedQuery.limit.value.at(limitIndex)?.value,
    offset: parsedQuery.limit.value.at(offsetIndex)?.value,
  };
};

export const setLimitAndOffset = (
  parsedQuery: NodeSqlParser.Select,
  limit: number,
  offset?: number,
) => {
  const value = [{ type: 'number', value: limit }];

  if (offset !== undefined) {
    value.push({ type: 'number', value: offset });
  }

  parsedQuery.limit = { seperator: ' OFFSET', value };
};
