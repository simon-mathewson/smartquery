import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import { QueriesContext } from '../../../Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils/limitAndOffset';
import { QueryContext, ResultContext } from '../../Context';
import type { Filter } from './types';
import { getAstFromFilters, getFiltersFromAst } from './utils';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';

export const useFilters = () => {
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const { updateQuery } = useDefinedContext(QueriesContext);

  const {
    query,
    query: { select },
  } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  const applyFilters = useCallback(
    async (filters: Filter[]) => {
      if (!columns || !select) return;

      const newStatement = cloneDeep(select.parsed);

      newStatement.where = getAstFromFilters({
        columns,
        filters,
        currentSchema:
          activeConnection.engine === 'postgres'
            ? activeConnection.schema
            : activeConnection.database,
      });

      // Remove offset
      const limitAndOffset = getLimitAndOffset(newStatement);
      if (limitAndOffset?.limit) {
        setLimitAndOffset(newStatement, limitAndOffset.limit);
      }

      const newSql = await getSqlForAst(newStatement, { engine: activeConnection.engine });
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
