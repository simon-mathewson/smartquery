import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import { TabsContext } from '~/content/tabs/Context';
import { getWhere } from './utils';
import NodeSqlParser from 'node-sql-parser';
import { get, isEqualWith } from 'lodash';
import { getParsedQuery, getParserOptions } from '../../utils';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils';
import { QueryContext, ResultContext } from '../../Context';

export const useSearch = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { updateQuery } = useDefinedContext(TabsContext);

  const { query } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  const search = useCallback(
    (searchValue: string) => {
      if (!activeConnection || !columns) return;

      const parsedQuery = getParsedQuery({
        engine: activeConnection.engine,
        query,
      });
      if (!parsedQuery || parsedQuery.type !== 'select') return;

      parsedQuery.where = searchValue
        ? getWhere({
            columns,
            engine: activeConnection.engine,
            searchValue,
          })
        : null;

      // Remove offset
      const limitAndOffset = getLimitAndOffset(parsedQuery);
      if (limitAndOffset?.limit) {
        setLimitAndOffset(parsedQuery, limitAndOffset.limit);
      }

      const newSql = new NodeSqlParser.Parser().sqlify(
        parsedQuery,
        getParserOptions(activeConnection.engine),
      );
      updateQuery(query.id, newSql);
    },
    [activeConnection, columns, query, updateQuery],
  );

  const searchValue = useMemo(() => {
    if (!activeConnection || !columns) return undefined;

    const parsedQuery = getParsedQuery({
      engine: activeConnection.engine,
      query,
    });
    if (!parsedQuery || parsedQuery.type !== 'select') return undefined;

    const searchWhere = getWhere({
      columns,
      engine: activeConnection.engine,
      searchValue: '',
    });
    if (!searchWhere) return undefined;

    const searchValues: string[] = [];

    const hasSearchStructure = isEqualWith(parsedQuery.where, searchWhere, (a) => {
      if (get(a, 'type') === 'binary_expr' && get(a, 'operator') === 'LIKE') {
        if (activeConnection.engine === 'postgresql') {
          if (get(a, 'right.type') === 'function' && get(a, 'right.name') === 'LOWER') {
            const value = get(a, 'right.args.value[0].value');
            if (value.startsWith('%') && value.endsWith('%')) {
              searchValues.push(value.slice(1, -1));
              return true;
            }
          } else {
            return false;
          }
        }

        const value = get(a, 'right.value');
        if (value.startsWith('%') && value.endsWith('%')) {
          searchValues.push(value.slice(1, -1));
          return true;
        }
      }
      return undefined;
    });
    if (!hasSearchStructure) return undefined;

    const areAllSearchValuesEqual = searchValues.every((value) => value === searchValues[0]);
    return areAllSearchValuesEqual ? searchValues[0] : undefined;
  }, [activeConnection, columns, query]);

  return useMemo(() => ({ search, searchValue }), [search, searchValue]);
};
