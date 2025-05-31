export type Connection = {
  database: string;
  defaultDatabase: string;
  engine: 'mysql' | 'postgres';
  host: string;
  password: string;
  port: number;
  user: string;
};
