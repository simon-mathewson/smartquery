import type { Connection } from '~/shared/types';

export const withQuotes = (engine: Connection['engine'], value: string) => {
  if (engine === 'mysql') return `\`${value}\``;
  return `"${value}"`;
};

export const parseStatements = (sql: string) => {
  const statements = sql
    .replaceAll(/\/\*[\S\s]*\*\/|--.*/g, '')
    .match(/(?:".*"|'.*'|`.*`|[^;])*(?:;)?/g)
    ?.map((statement) => statement.trim())
    .filter(Boolean);

  if (!statements) {
    throw new Error('No statements found in query');
  }

  return statements;
};
