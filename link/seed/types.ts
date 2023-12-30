export type Connection = {
  database: string;
  defaultDatabase: string;
  engine: 'mysql' | 'postgresql';
  password: string;
  port: number;
  user: string;
};
