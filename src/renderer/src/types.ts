export type Connection = {
  database: string;
  host: string;
  name: string;
  port: number;
};

export type Query = {
  hasResults?: boolean;
  id: string;
  label?: string;
  sql?: string;
  showEditor?: boolean;
};

export type SendQuery = Awaited<ReturnType<typeof window.api.connectDb>>['query'];
