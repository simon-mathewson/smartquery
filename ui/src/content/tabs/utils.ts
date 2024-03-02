import type { Query } from '~/shared/types';
import type { AddQueryOptions } from './types';
import * as uuid from 'uuid';

export const getNewQuery = ({ showEditor, sql, table }: AddQueryOptions) =>
  ({
    id: uuid.v4(),
    showEditor: showEditor === true,
    sql: sql ?? null,
    table: table ?? null,
  }) satisfies Query;
