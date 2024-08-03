import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import { getFiltersFromAst, getAstFromFilters } from './utils';
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
    query: { select },
  } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  const applyFilters = useCallback(
    async (filters: Filter[]) => {
      if (!activeConnection || !columns || !select) return;

      const newStatement = cloneDeep(select.parsed);

      newStatement.where = getAstFromFilters({ columns, filters });

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
    [activeConnection, columns, select, query.id, updateQuery],
  );

  const filters = useMemo<Filter[]>(() => {
    if (!activeConnection || !columns || !select || select.parsed.where?.type !== 'binary_expr') {
      return [];
    }

    try {
      const filters = getFiltersFromAst(select.parsed.where);
      return filters;
    } catch (error) {
      console.error(error, select.parsed.where);
      return [];
    }
  }, [activeConnection, columns, select]);

  return useMemo(() => ({ applyFilters, filters }), [applyFilters, filters]);
};
