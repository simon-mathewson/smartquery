import { cloneDeep } from 'lodash';
import type { Connection } from '@/connections/types';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import type { Select } from '../types';

export const getTotalRowsStatement = async (props: { connection: Connection; select: Select }) => {
  const { connection, select } = props;

  const totalQuery = cloneDeep(select.parsed);

  totalQuery.limit = null;
  totalQuery.orderby = null;
  totalQuery.columns = [
    {
      expr: { type: 'aggr_func', name: 'COUNT', args: { expr: { type: 'star', value: '*' } } },
      as: 'count',
    },
  ];

  try {
    const statement = await getSqlForAst(totalQuery, {
      engine: connection.engine,
      skipFormat: true,
    });
    return statement;
  } catch (error) {
    console.error(error);
    return null;
  }
};
