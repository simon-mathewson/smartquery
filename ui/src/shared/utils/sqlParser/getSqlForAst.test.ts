import type NodeSqlParser from 'node-sql-parser';
import { describe, expect, test } from 'vitest';
import { getSqlForAst } from './getSqlForAst';

const ast = {
  columns: [
    {
      as: null,
      expr: {
        column: '*',
        table: null,
        type: 'column_ref',
      },
    },
  ],
  distinct: null,
  from: [
    {
      as: null,
      db: null,
      table: 'users',
    },
    {
      as: null,
      db: null,
      join: 'INNER JOIN',
      on: {
        left: {
          column: 'id',
          table: 'users',
          type: 'column_ref',
        },
        operator: '=',
        right: {
          column: 'user_id',
          table: 'posts',
          type: 'column_ref',
        },
        type: 'binary_expr',
      },
      table: 'posts',
    },
  ],
  groupby: {
    columns: null,
    modifiers: [],
  },
  having: null,
  limit: {
    seperator: '',
    value: [
      {
        type: 'number',
        value: 1,
      },
    ],
  },
  options: null,
  orderby: [
    {
      expr: {
        column: 'id',
        table: 'users',
        type: 'column_ref',
      },
      type: 'ASC',
    },
  ],
  type: 'select',
  where: {
    left: {
      column: 'id',
      table: 'users',
      type: 'column_ref',
    },
    operator: '=',
    right: {
      type: 'number',
      value: 1,
    },
    type: 'binary_expr',
  },
  with: null,
} satisfies NodeSqlParser.AST;

describe('getSqlForAst generates SQL for AST', () => {
  test('MySQL', async () => {
    expect(await getSqlForAst(ast, { engine: 'mysql' })).toMatchSnapshot();
  });

  test('PostgreSQL', async () => {
    expect(await getSqlForAst(ast, { engine: 'postgres' })).toMatchSnapshot();
  });
});
