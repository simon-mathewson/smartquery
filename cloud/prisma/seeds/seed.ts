import { PrismaClient } from '../generated';

(async () => {
  console.info('Seeding database...');

  const prisma = new PrismaClient();

  await prisma.user.create({
    data: {
      dataEncryptionKey:
        '54ad804c62507b42d63959046c1d0c92f21129e297655ecf10b79a580ee582cf1483d8d2385ead75393027ba51f995f3',
      dataEncryptionKeyNonce: '8f242f469d64fb04c061b40898d0b5fcb4ab0f6acee5f058',
      email: 'test@dabase.dev',
      keyEncryptionKeySalt: 'eb8943e0cd3e0d2ac3f945a20272a70a',
      password:
        '5172332a5b34fbbafecf69a277f3022e45215916fba3f38ff8a61cb0072a5dbb6f6c3ca7923e7b2c8467d21659ef276a31220bb8e9ae47b380c9d1f0dc02c244',
      passwordSalt: '31c7bc712b3c556d63dda05d49ec172d',
    },
  });

  await prisma.connection.create({
    data: {
      database: 'postgres_db',
      dbUser: 'postgres',
      engine: 'postgres',
      host: 'localhost',
      name: 'postgres_db',
      user: {
        connect: {
          email: 'test@dabase.dev',
        },
      },
      encryptCredentials: false,
      password: 'password',
      port: 5433,
      schema: 'public',
    },
  });

  await prisma.connection.create({
    data: {
      database: 'mysql_db',
      dbUser: 'root',
      engine: 'mysql',
      host: 'localhost',
      name: 'mysql_db',
      user: {
        connect: {
          email: 'test@dabase.dev',
        },
      },
      encryptCredentials: false,
      password: 'password',
      port: 3307,
    },
  });

  await prisma.connection.create({
    data: {
      database: 'dabase_cloud',
      dbUser: 'postgres',
      engine: 'postgres',
      host: 'localhost',
      name: 'Dabase Dev',
      user: {
        connect: {
          email: 'test@dabase.dev',
        },
      },
      encryptCredentials: false,
      password: 'password',
      port: 5444,
      schema: 'public',
    },
  });

  await prisma.connection.create({
    data: {
      database: 'dabase_cloud',
      dbUser: 'postgres',
      engine: 'postgres',
      host: '-',
      name: 'Dabase Prod',
      user: {
        connect: {
          email: 'test@dabase.dev',
        },
      },
      encryptCredentials: true,
      password: '',
      port: 5432,
      schema: 'public',
      sshHost: 'bastion.dabase.dev',
      sshPort: 22,
      sshUser: 'ec2-user',
    },
  });

  await prisma.connection.create({
    data: {
      database: 'pfmegrnargs',
      dbUser: 'postgres',
      engine: 'postgres',
      host: 'hh-pgsql-public.ebi.ac.uk',
      name: 'RNAcentral',
      user: {
        connect: {
          email: 'test@dabase.dev',
        },
      },
      encryptCredentials: false,
      password: 'NWDMCE5xdipIjRrp',
      port: 5432,
    },
  });

  await prisma.connection.create({
    data: {
      database: 'Rfam',
      dbUser: 'rfamro',
      engine: 'postgres',
      host: 'mysql-rfam-public.ebi.ac.uk',
      name: 'Rfam',
      user: {
        connect: {
          email: 'test@dabase.dev',
        },
      },
      encryptCredentials: false,
      password: '',
      port: 4497,
    },
  });

  console.info('Seeding complete.');
})();
