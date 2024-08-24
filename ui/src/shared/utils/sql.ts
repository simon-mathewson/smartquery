import type { Connection } from '~/shared/types';

export const addQuotes = (engine: Connection['engine'], value: string) => {
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
