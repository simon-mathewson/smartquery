export type Connection = {
  database: string;
  host: string;
  name: string;
  port: number;
};

export type Query = {
  label?: string;
  sql?: string;
};
