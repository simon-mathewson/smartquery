import { Client } from 'pg';
import type { Api } from './index.d';

const clientRef: { current: Client | null } = {
  current: null,
};

export const connectDb: Api['connectDb'] = async (connection) => {
  const { database, host, port } = connection;

  await clientRef.current?.end();

  clientRef.current = new Client({
    database,
    host,
    password: 'password',
    port,
    user: 'postgres',
  });

  await clientRef.current.connect();

  return {
    query: (text: string) => clientRef.current!.query(text),
  };
};
