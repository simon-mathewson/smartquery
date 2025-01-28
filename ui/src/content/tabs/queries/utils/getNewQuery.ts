import * as uuid from 'uuid';
import type { Connection, Query } from '~/shared/types';
import type { AddQueryOptions } from '../types';
import { parseQuery } from './parse';

export const getNewQuery = (props: {
  addQueryOptions: AddQueryOptions;
  connection: Connection;
}) => {
  const {
    addQueryOptions: { showEditor, sql },
    connection,
  } = props;

  return {
    id: uuid.v4(),
    isLoading: false,
    showEditor: showEditor === true,
    sql: sql ?? null,
    ...(sql ? parseQuery({ connection, sql }) : { select: null, statements: null }),
  } satisfies Query;
};
