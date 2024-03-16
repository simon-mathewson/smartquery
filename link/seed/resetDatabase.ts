import { createClient } from './createClient';
import type { Connection } from './types';

export const resetDatabase = async (connection: Connection) => {
  const { database, engine } = connection;

  const prisma = await createClient(connection, { useDefaultDatabase: true });

  await prisma.$queryRawUnsafe(`
    DROP DATABASE IF EXISTS ${database} ${engine === 'postgresql' ? 'WITH (FORCE)' : ''};
  `);

  await prisma.$queryRawUnsafe(`
    CREATE DATABASE ${database};
  `);

  await prisma.$disconnect();
};
