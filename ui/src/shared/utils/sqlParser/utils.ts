import NodeSqlParser from 'node-sql-parser';
import type { Connection } from '@/types/connection';

export const sqlParser = new NodeSqlParser.Parser();

export const getParserOptions = (engine: Connection['engine']) => ({
  database: {
    mysql: 'mysql',
    postgres: 'postgresql',
    sqlite: 'sqlite',
  }[engine],
});
