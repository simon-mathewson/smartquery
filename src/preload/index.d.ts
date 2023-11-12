import type { QueryResult } from 'pg';

declare global {
  interface Window {
    api: Api;
  }
}

export type Api = {
  connectDb: (connection: Connection) => Promise<{ sendQuery: SendQuery }>;
};

export type Connection = {
  database: string;
  host: string;
  name: string;
  password: string;
  port: number;
  user: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SendQuery = (sql: string) => Promise<QueryResult<any>>;
