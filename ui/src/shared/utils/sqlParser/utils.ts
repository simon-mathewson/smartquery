import type { Connection } from '@/connections/types';
import type NodeSqlParser from 'node-sql-parser';

export const getSqlParser = () => import('node-sql-parser').then((m) => new m.Parser());

export const getParserOptions = (engine: Connection['engine']): NodeSqlParser.Option => ({
  database: {
    mysql: 'mysql',
    postgres: 'postgresql',
    sqlite: 'sqlite',
  }[engine],
});
