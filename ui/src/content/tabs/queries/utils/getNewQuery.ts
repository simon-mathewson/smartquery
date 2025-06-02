import * as uuid from 'uuid';
import type { Query } from '~/shared/types';
import type { Connection } from '@/types/connection';
import type { AddQueryOptions } from '../types';
import { parseQuery } from './parse';

export const getNewQuery = (props: {
  addQueryOptions: AddQueryOptions;
  connection: Connection;
}) => {
  const {
    addQueryOptions: { initialInputMode, sql },
    connection,
  } = props;

  return {
    id: uuid.v4(),
    isLoading: false,
    initialInputMode,
    sql: sql ?? null,
    ...(sql ? parseQuery({ connection, sql }) : { select: null, statements: null }),
  } satisfies Query;
};
