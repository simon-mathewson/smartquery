import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import { getFilters, getWhereAst } from './utils';
import NodeSqlParser from 'node-sql-parser';
import { getParserOptions } from '~/shared/utils/parser';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils';
import { QueryContext, ResultContext } from '../../Context';
import { QueriesContext } from '../../../Context';
import type { Filter } from './types';

export const useFilters = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { updateQuery } = useDefinedContext(QueriesContext);

  const {
    query,
    query: { firstSelectStatement },
  } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  const applyFilters = useCallback(
    async (filters: Filter[]) => {
      if (!activeConnection || !columns || !firstSelectStatement) return;

      const newStatement = cloneDeep(firstSelectStatement.parsed);

      newStatement.where = getWhereAst({ columns, filters });

      // Remove offset
      const limitAndOffset = getLimitAndOffset(newStatement);
      if (limitAndOffset?.limit) {
        setLimitAndOffset(newStatement, limitAndOffset.limit);
      }

      const newSql = new NodeSqlParser.Parser().sqlify(
        newStatement,
        getParserOptions(activeConnection.engine),
      );
      await updateQuery({ id: query.id, run: true, sql: newSql });
    },
    [activeConnection, columns, firstSelectStatement, query.id, updateQuery],
  );

  const filters = useMemo<Filter[]>(() => {
    if (
      !activeConnection ||
      !columns ||
      !firstSelectStatement ||
      firstSelectStatement.parsed.where?.type !== 'binary_expr'
    ) {
      return [];
    }

    try {
      const filters = getFilters(firstSelectStatement.parsed.where);
      return filters;
    } catch {
      return [];
    }
  }, [activeConnection, columns, firstSelectStatement]);

  return useMemo(() => ({ applyFilters, filters }), [applyFilters, filters]);
};
