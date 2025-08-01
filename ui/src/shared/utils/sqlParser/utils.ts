import type { Connection } from '@/connections/types';

export const getSqlParser = () => import('node-sql-parser').then((m) => new m.Parser());

export const getParserOptions = (engine: Connection['engine']) => ({
  database: {
    mysql: 'mysql',
    postgres: 'postgresql',
    sqlite: 'sqlite',
  }[engine],
});
