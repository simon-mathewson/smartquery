import { Client } from 'pg';
import type { Api } from './index.d';

const clientRef: { current: Client | null } = {
  current: null,
};

export const connectDb: Api['connectDb'] = async (connection) => {
  const { database, host, password, port, user } = connection;

  await clientRef.current?.end();

  clientRef.current = new Client({
    database,
    host,
    password,
    port,
    user,
  });

  await clientRef.current.connect();

  return {
    sendQuery: (text) => clientRef.current!.query(text),
  };
};
