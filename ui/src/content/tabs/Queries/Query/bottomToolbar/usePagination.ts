import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getParsedQuery, getParserOptions, sqlParser } from '../utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import { trpc } from '~/trpc';
import { TabsContext } from '~/content/tabs/Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../utils';
import { QueryContext } from '../Context';

export const usePagination = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { updateQuery } = useDefinedContext(TabsContext);

  const { query } = useDefinedContext(QueryContext);

  const parsedQuery = useMemo(() => {
    if (!activeConnection) return null;

    const parsedQuery = getParsedQuery({
      engine: activeConnection.engine,
      query,
    });
    if (!parsedQuery || parsedQuery.type !== 'select' || !parsedQuery.limit) return null;

    return parsedQuery;
  }, [activeConnection, query]);

  const limitAndOffset = useMemo(
    () => (parsedQuery ? getLimitAndOffset(parsedQuery) : null),
    [parsedQuery],
  );

  const [total, setTotal] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!parsedQuery?.limit || !activeConnection) return;
    const totalQuery = cloneDeep(parsedQuery);
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
  }, [activeConnection, parsedQuery]);

  const updateQueryOffset = useCallback(
    async (newOffset: number) => {
      if (!limitAndOffset?.limit || !parsedQuery || !activeConnection) return;

      const newQuery = cloneDeep(parsedQuery);
      setLimitAndOffset(newQuery, limitAndOffset.limit, newOffset);

      const sql = sqlParser.sqlify(newQuery, getParserOptions(activeConnection.engine));

      await updateQuery(query.id, sql);
    },
    [activeConnection, limitAndOffset?.limit, parsedQuery, query.id, updateQuery],
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
