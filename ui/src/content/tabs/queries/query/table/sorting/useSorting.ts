import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { getSortedColumnFromAst } from './utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueryContext } from '../../Context';
import { getParserOptions, sqlParser } from '~/shared/utils/parser';
import type NodeSqlParser from 'node-sql-parser';
import { ConnectionsContext } from '~/content/connections/Context';
import { QueriesContext } from '../../../Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils';

export const useSorting = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);

  const sortedColumn = useMemo(
    () => (query.select ? getSortedColumnFromAst(query.select) : null),
    [query.select],
  );

  const toggleSort = useCallback(
    (columnName: string) => {
      if (!query.select || !activeConnection) return;

      const newSortDirection = (() => {
        if (sortedColumn?.columnName !== columnName) return 'ASC';
        return sortedColumn.direction === 'ASC' ? 'DESC' : null;
      })();

      const orderByAst: NodeSqlParser.OrderBy[] | null = newSortDirection
        ? [
            {
              type: newSortDirection,
              expr: { type: 'column_ref', column: columnName },
            },
          ]
        : null;

      const newStatement = cloneDeep(query.select.parsed);
      newStatement.orderby = orderByAst;

      // Remove offset
      const limitAndOffset = getLimitAndOffset(newStatement);
      if (limitAndOffset?.limit) {
        setLimitAndOffset(newStatement, limitAndOffset.limit);
      }

      const sql = sqlParser.sqlify(newStatement, getParserOptions(activeConnection.engine));

      void updateQuery({ id: query.id, run: true, sql });
    },
    [activeConnection, query.id, query.select, sortedColumn, updateQuery],
  );

  return useMemo(() => ({ sortedColumn, toggleSort }), [sortedColumn, toggleSort]);
};
