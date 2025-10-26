import { cloneDeep } from 'lodash';
import type NodeSqlParser from 'node-sql-parser';
import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import { QueriesContext } from '../../../Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils/limitAndOffset';
import { QueryContext } from '../../Context';
import { getSortedColumnFromAst } from './utils';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import type { Column } from '~/shared/types';
import { compareColumnRefs, getColumnRef } from '../../../utils/columnRefs';

export const useSorting = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { query } = useDefinedContext(QueryContext);

  const sortedColumn = useMemo(
    () => (query.select ? getSortedColumnFromAst(query.select) : null),
    [query.select],
  );

  const toggleSort = useCallback(
    async (column: Column) => {
      if (!query.select) return;

      const columnRef = getColumnRef(
        column,
        'schema' in activeConnection ? activeConnection.schema : activeConnection.database,
      );

      const newSortDirection = (() => {
        if (!sortedColumn || !compareColumnRefs(sortedColumn, columnRef)) return 'ASC';
        return sortedColumn.direction === 'ASC' ? 'DESC' : null;
      })();

      const orderByAst: NodeSqlParser.OrderBy[] | null = newSortDirection
        ? [
            {
              type: newSortDirection,
              expr: {
                type: 'column_ref',
                ...columnRef,
              } satisfies NodeSqlParser.ColumnRef,
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

      const sql = await getSqlForAst(newStatement, { engine: activeConnection.engine });

      void updateQuery({ id: query.id, run: true, sql });

      track('table_sort', { direction: newSortDirection });
    },
    [activeConnection, query.id, query.select, sortedColumn, updateQuery, track],
  );

  return useMemo(() => ({ sortedColumn, toggleSort }), [sortedColumn, toggleSort]);
};
