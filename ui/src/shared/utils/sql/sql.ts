import type { Engine } from '@/connections/types';

export const addQuotes = (engine: Engine, value: string) => {
  if (engine === 'mysql') return `\`${value}\``;
  return `"${value}"`;
};

export const splitSqlStatements = (sql: string) => {
  const statements = sql
    .replaceAll(/\/\*[\S\s]*\*\/|--.*/g, '')
    .match(/(?:".*"|'.*'|`.*`|[^;])*(?:;)?/g)
    ?.map((statement) => statement.trim())
    .filter(Boolean);

  return statements ?? [];
};
