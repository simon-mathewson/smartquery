import type { Connection } from '@/types/connection';

export const getSqlParser = () => import('node-sql-parser').then((m) => new m.Parser());

export const getParserOptions = (engine: Connection['engine']) => ({
  database: {
    mysql: 'mysql',
    postgres: 'postgresql',
    sqlite: 'sqlite',
  }[engine],
});
