import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '~/content/connections/Context';
import { getWhere } from './utils';
import NodeSqlParser from 'node-sql-parser';
import { get, isEqualWith } from 'lodash';
import { getParserOptions } from '~/shared/utils/parser';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils';
import { QueryContext, ResultContext } from '../../Context';
import { QueriesContext } from '../../../Context';

export const useSearch = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { updateQuery } = useDefinedContext(QueriesContext);

  const {
    query,
    query: { select },
  } = useDefinedContext(QueryContext);

  const { columns } = useDefinedContext(ResultContext);

  const search = useCallback(
    async (searchValue: string) => {
      if (!activeConnection || !columns || !select) return;

      const newStatement = cloneDeep(select.parsed);

      newStatement.where = searchValue
        ? getWhere({
            columns,
            engine: activeConnection.engine,
            searchValue,
          })
        : null;

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

  const searchValue = useMemo(() => {
    if (!activeConnection || !columns || !select) return undefined;

    const searchWhere = getWhere({
      columns,
      engine: activeConnection.engine,
      searchValue: '',
    });
    if (!searchWhere) return undefined;

    const searchValues: string[] = [];

    const hasSearchStructure = isEqualWith(select.parsed.where, searchWhere, (a) => {
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
  }, [activeConnection, columns, select]);

  return useMemo(() => ({ search, searchValue }), [search, searchValue]);
};
