import type { Engine } from '@/connections/types';
import type { FormatOptionsWithLanguage } from 'sql-formatter';

export const addQuotes = (engine: Engine, value: string) => {
  if (engine === 'mysql') return `\`${value}\``;
  return `"${value}"`;
};

export const escapeValue = (engine: Engine, value: string): string => {
  switch (engine) {
    case 'mysql':
      // MySQL: escape single quotes by doubling them, and escape backslashes
      return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
    default:
      // PostgreSQL: escape single quotes by doubling them
      // SQLite: escape single quotes by doubling them
      // Default to PostgreSQL-style escaping
      return value.replace(/'/g, "''");
  }
};

export const splitSqlStatements = (sql: string) => {
  // First, temporarily replace quoted strings with placeholders
  const quotes: string[] = [];
  let quoteIndex = 0;

  // Process all quotes in the order they appear in the string
  let result = sql;
  let i = 0;

  while (i < result.length) {
    const char = result[i];

    if (char === "'" || char === '"' || char === '`') {
      const quoteChar = char;
      const start = i;
      i++; // Skip opening quote

      // Find the closing quote, handling escaped quotes
      while (i < result.length) {
        if (result[i] === quoteChar && result[i - 1] !== '\\') {
          // Found closing quote
          const match = result.substring(start, i + 1);
          quotes.push(match);
          const placeholder = `__QUOTE_${quoteIndex++}__`;
          result = result.substring(0, start) + placeholder + result.substring(i + 1);
          i = start + placeholder.length;
          break;
        }
        i++;
      }
    } else {
      i++;
    }
  }

  // Now remove comments from the non-quoted portions
  result = result.replace(/\/\*[\S\s]*?\*\//g, ''); // Remove block comments
  result = result.replace(/--.*$/gm, ''); // Remove line comments

  // Split into statements using semicolon as delimiter (but not inside quote placeholders)
  const statements = result
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  // Restore the quoted strings in each statement
  return statements.map((statement) => {
    let restoredStatement = statement;
    quotes.forEach((quote, index) => {
      restoredStatement = restoredStatement.replace(`__QUOTE_${index}__`, quote);
    });
    return restoredStatement;
  });
};

export const formatSql = async (sql: string, languageProp?: Engine | 'sql') => {
  const { format: formatSql } = await import('sql-formatter');

  const language: FormatOptionsWithLanguage['language'] = languageProp
    ? (
        {
          mysql: 'mysql',
          postgres: 'postgresql',
          sqlite: 'sqlite',
          sql: 'sql',
        } as const
      )[languageProp]
    : 'sql';

  try {
    return formatSql(sql, { language });
  } catch {
    return sql;
  }
};
