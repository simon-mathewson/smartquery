import NodeSqlParser from 'node-sql-parser';
import type { Connection } from '~/shared/types';

export const sqlParser = new NodeSqlParser.Parser();

export const getParserOptions = (engine: Connection['engine']) => ({
  database: {
    mysql: 'mysql',
    postgres: 'postgres',
    sqlite: 'sqlite',
  }[engine],
});
