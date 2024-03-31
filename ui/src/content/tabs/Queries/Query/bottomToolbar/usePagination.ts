import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import { trpc } from '~/trpc';
import { TabsContext } from '~/content/tabs/Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../utils';
import { QueryContext } from '../Context';
import { getParserOptions, sqlParser } from '~/shared/utils/parser';

export const usePagination = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { updateQuery } = useDefinedContext(TabsContext);

  const {
    query,
    query: { firstSelectStatement },
  } = useDefinedContext(QueryContext);

  const limitAndOffset = useMemo(
    () => (firstSelectStatement ? getLimitAndOffset(firstSelectStatement.parsed) : null),
    [firstSelectStatement],
  );

  const [total, setTotal] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!firstSelectStatement?.parsed.limit || !activeConnection) return;
    const totalQuery = cloneDeep(firstSelectStatement.parsed);
    totalQuery.limit = null;
    totalQuery.columns = [
      {
        expr: { type: 'aggr_func', name: 'COUNT', args: { expr: { type: 'star', value: '*' } } },
        as: 'count',
      },
    ];

    const statement = sqlParser.sqlify(totalQuery, getParserOptions(activeConnection?.engine));

    trpc.sendQuery
      .mutate({ clientId: activeConnection.clientId, statements: [statement] })
      .then((results) => {
        const count = results[0][0].count;
        setTotal(count ? Number(count) : undefined);
      });
  }, [activeConnection, firstSelectStatement?.parsed]);

  const updateQueryOffset = useCallback(
    async (newOffset: number) => {
      if (!limitAndOffset?.limit || !firstSelectStatement || !activeConnection) return;

      const newQuery = cloneDeep(firstSelectStatement.parsed);
      setLimitAndOffset(newQuery, limitAndOffset.limit, newOffset);

      const sql = sqlParser.sqlify(newQuery, getParserOptions(activeConnection.engine));

      await updateQuery({ id: query.id, run: true, sql });
    },
    [activeConnection, firstSelectStatement, limitAndOffset?.limit, query.id, updateQuery],
  );

  const next = useCallback(async () => {
    if (!limitAndOffset?.limit || !total) return;

    const newOffset = (limitAndOffset.offset ?? 0) + limitAndOffset.limit;
    if (newOffset >= total) {
      throw new Error('Cannot go past the last page');
    }

    updateQueryOffset(newOffset);
  }, [limitAndOffset, total, updateQueryOffset]);

  const previous = useCallback(async () => {
    if (!limitAndOffset?.limit || !total) return;

    const newOffset = Math.max((limitAndOffset.offset ?? 0) - limitAndOffset.limit, 0);

    updateQueryOffset(newOffset);
  }, [limitAndOffset, total, updateQueryOffset]);

  return useMemo(
    () => ({
      limit: limitAndOffset?.limit,
      next,
      offset: limitAndOffset?.offset,
      previous,
      total,
    }),
    [limitAndOffset, next, previous, total],
  );
};
