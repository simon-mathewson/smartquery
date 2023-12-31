export type Connection = {
  database: string;
  defaultDatabase: string;
  engine: 'mysql' | 'postgresql' | 'sqlserver';
  host: string;
  password: string;
  port: number;
  user: string;
};
