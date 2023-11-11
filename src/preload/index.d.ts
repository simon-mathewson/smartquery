import type { QueryResult } from 'pg';

export type Api = {
  connectDb: (connection: {
    database: string;
    host: string;
    port: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => Promise<{ query: (sql: string) => Promise<QueryResult<any>> }>;
};

declare global {
  interface Window {
    api: Api;
  }
}
