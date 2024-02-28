import type { Query } from '~/shared/types';
import type { AddQueryOptions } from './types';
import { uniqueId } from 'lodash';

export const getNewQuery = ({ showEditor, sql, table }: AddQueryOptions) =>
  ({
    columns: [],
    hasResults: false,
    id: uniqueId(),
    rows: [],
    showEditor: showEditor === true,
    sql: sql ?? null,
    table: table ?? null,
  }) satisfies Query;
