import type { Connection } from '~/content/connections/types';

export const withQuotes = (engine: Connection['engine'], value: string) => {
  if (engine === 'mysql') return `\`${value}\``;
  return `"${value}"`;
};
