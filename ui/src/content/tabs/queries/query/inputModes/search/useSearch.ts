import { cloneDeep, get, isEqualWith } from 'lodash';
import { useCallback, useMemo } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import { QueriesContext } from '../../../Context';
import { getLimitAndOffset, setLimitAndOffset } from '../../../utils/limitAndOffset';
import { QueryContext, ResultContext } from '../../Context';
import { getWhere } from './utils';

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

      const newSql = getSqlForAst(newStatement, activeConnection.engine);
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
        if (activeConnection.engine === 'postgres') {
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
