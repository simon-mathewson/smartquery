import * as uuid from 'uuid';
import type { Query } from '~/shared/types';
import type { Connection } from '@/connections/types';
import type { AddQueryOptions } from '../types';
import { parseQuery } from './parse';

export const getNewQuery = async (props: {
  addQueryOptions: AddQueryOptions;
  connection: Connection;
}) => {
  const {
    addQueryOptions: { initialInputMode, sql, savedQueryId, chart, name },
    connection,
  } = props;

  return {
    chart,
    id: uuid.v4(),
    initialInputMode,
    isLoading: false,
    savedQueryId,
    sql: sql ?? null,
    name,
    ...(sql ? await parseQuery({ connection, sql }) : { select: null, statements: null }),
  } satisfies Query;
};
