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
    addQueryOptions: { initialInputMode, sql, savedQueryId, chart },
    connection,
  } = props;

  return {
    id: uuid.v4(),
    isLoading: false,
    initialInputMode,
    sql: sql ?? null,
    savedQueryId,
    chart,
    ...(sql ? await parseQuery({ connection, sql }) : { select: null, statements: null }),
  } satisfies Query;
};
