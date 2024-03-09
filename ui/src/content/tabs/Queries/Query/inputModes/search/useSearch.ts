import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import type { Query } from '~/shared/types';
import { TabsContext } from '~/content/tabs/Context';
import { getParsedQuery, getParserOptions, getWhere } from './utils';
import NodeSqlParser from 'node-sql-parser';
import { get, isEqualWith } from 'lodash';

export const useSearch = (query: Query) => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { queryResults, updateQuery } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const search = useCallback(
    (searchValue: string) => {
      if (!activeConnection || !queryResult?.columns) return;

      const parsedQuery = getParsedQuery({
        engine: activeConnection.engine,
        query,
      });
      if (!parsedQuery || parsedQuery.type !== 'select') return;

      parsedQuery.where = searchValue
        ? getWhere({
            columns: queryResult.columns,
            engine: activeConnection.engine,
            searchValue,
          })
        : null;

      const newSql = new NodeSqlParser.Parser().sqlify(
        parsedQuery,
        getParserOptions(activeConnection.engine),
      );
      updateQuery(query.id, newSql);
    },
    [activeConnection, query, queryResult?.columns, updateQuery],
  );

  const searchValue = useMemo(() => {
    if (!activeConnection || !queryResult?.columns) return undefined;

    const parsedQuery = getParsedQuery({
      engine: activeConnection.engine,
      query,
    });
    if (!parsedQuery || parsedQuery.type !== 'select') return undefined;

    const searchWhere = getWhere({
      columns: queryResult.columns,
      engine: activeConnection.engine,
      searchValue: '',
    });
    if (!searchWhere) return undefined;

    const searchValues: string[] = [];

    const hasSearchStructure = isEqualWith(parsedQuery.where, searchWhere, (a) => {
      if (get(a, 'type') === 'binary_expr' && get(a, 'operator') === 'LIKE') {
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
  }, [activeConnection, query, queryResult?.columns]);

  return useMemo(() => ({ search, searchValue }), [search, searchValue]);
};
