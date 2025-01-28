import * as uuid from 'uuid';
import type { Connection, Query } from '~/shared/types';
import type { AddQueryOptions } from '../types';
import { parseQuery } from './parse';

export const getNewQuery = (props: {
  addQueryOptions: AddQueryOptions;
  engine: Connection['engine'];
}) => {
  const {
    addQueryOptions: { showEditor, sql },
    engine,
  } = props;

  return {
    id: uuid.v4(),
    isLoading: false,
    showEditor: showEditor === true,
    sql: sql ?? null,
    ...(sql ? parseQuery({ engine, sql }) : { select: null, statements: null }),
  } satisfies Query;
};
