import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import { QueriesContext } from '../../Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../utils/limitAndOffset';
import { QueryContext, ResultContext } from '../Context';

export const usePagination = () => {
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const { updateQuery } = useDefinedContext(QueriesContext);

  const {
    query,
    query: { select },
  } = useDefinedContext(QueryContext);

  const { totalRows } = useDefinedContext(ResultContext);

  const limitAndOffset = useMemo(
    () => (select ? getLimitAndOffset(select.parsed) : null),
    [select],
  );

  const updateQueryOffset = useCallback(
    async (newOffset: number) => {
      if (!limitAndOffset?.limit || !select || !activeConnection) return;

      const newQuery = cloneDeep(select.parsed);
      setLimitAndOffset(newQuery, limitAndOffset.limit, newOffset);

      const sql = await getSqlForAst(newQuery, activeConnection.engine);

      await updateQuery({ id: query.id, run: true, sql });
    },
    [activeConnection, select, limitAndOffset?.limit, query.id, updateQuery],
  );

  const next = useCallback(async () => {
    if (!limitAndOffset?.limit || !totalRows) return;

    const newOffset = (limitAndOffset.offset ?? 0) + limitAndOffset.limit;
    if (newOffset >= totalRows) {
      throw new Error('Cannot go past the last page');
    }

    updateQueryOffset(newOffset);
  }, [limitAndOffset, totalRows, updateQueryOffset]);

  const previous = useCallback(async () => {
    if (!limitAndOffset?.limit || !totalRows) return;

    const newOffset = Math.max((limitAndOffset.offset ?? 0) - limitAndOffset.limit, 0);

    updateQueryOffset(newOffset);
  }, [limitAndOffset, totalRows, updateQueryOffset]);

  return useMemo(
    () => ({
      limit: limitAndOffset?.limit,
      next,
      offset: limitAndOffset?.offset,
      previous,
      totalRows,
    }),
    [limitAndOffset, next, previous, totalRows],
  );
};
