import { createClient } from './createClient';
import { Connection } from './types';

export const resetDatabase = async (connection: Connection) => {
  const { database, engine } = connection;

  const prisma = await createClient(connection, { useDefaultDatabase: true });

  if (engine === 'sqlserver') {
    try {
      await prisma.$queryRawUnsafe(`
      ALTER DATABASE ${database} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    `);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  await prisma.$queryRawUnsafe(`
    DROP DATABASE IF EXISTS ${database} ${engine === 'postgresql' ? 'WITH (FORCE)' : ''};
  `);

  await prisma.$queryRawUnsafe(`
    CREATE DATABASE ${database};
  `);

  await prisma.$disconnect();
};
