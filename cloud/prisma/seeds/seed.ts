import path from 'node:path';
import fs from 'node:fs';
import { PrismaClient } from '../generated';

void (async () => {
  console.info('Seeding database...');

  const prisma = new PrismaClient();

  const user = await prisma.user.create({
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

  const plusUser = await prisma.user.create({
    data: {
      dataEncryptionKey:
        '54ad804c62507b42d63959046c1d0c92f21129e297655ecf10b79a580ee582cf1483d8d2385ead75393027ba51f995f3',
      dataEncryptionKeyNonce: '8f242f469d64fb04c061b40898d0b5fcb4ab0f6acee5f058',
      email: 'plus@dabase.dev',
      keyEncryptionKeySalt: 'eb8943e0cd3e0d2ac3f945a20272a70a',
      password:
        '5172332a5b34fbbafecf69a277f3022e45215916fba3f38ff8a61cb0072a5dbb6f6c3ca7923e7b2c8467d21659ef276a31220bb8e9ae47b380c9d1f0dc02c244',
      passwordSalt: '31c7bc712b3c556d63dda05d49ec172d',
    },
  });

  await prisma.subscription.create({
    data: {
      startDate: new Date(),
      type: 'plus',
      userId: plusUser.id,
    },
  });

  await prisma.usage.create({
    data: {
      amount: 20_438,
      type: 'queryDurationSeconds',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 1_843,
      type: 'queryDurationSeconds',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 147_483_648,
      type: 'queryResponseBytes',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 847_484_438,
      type: 'queryResponseBytes',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 332_328,
      type: 'aiChatInputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 237_249,
      type: 'aiChatInputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 4_238,
      type: 'aiChatOutputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 13_832,
      type: 'aiChatOutputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 4_423_843,
      type: 'aiInlineCompletionInputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 9_843_243,
      type: 'aiInlineCompletionInputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 234_438,
      type: 'aiInlineCompletionOutputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  await prisma.usage.create({
    data: {
      amount: 185_328,
      type: 'aiInlineCompletionOutputTokens',
      subscription: { connect: { userId: plusUser.id } },
    },
  });

  const createConnections = async (userEmail: string) => {
    await prisma.connection.create({
      data: {
        database: 'postgres_db',
        dbUser: 'postgres',
        engine: 'postgres',
        host: 'localhost',
        name: 'postgres_db',
        user: {
          connect: {
            email: userEmail,
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
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 3307,
      },
    });

    const sshKey = fs.readFileSync(
      path.join(__dirname, '../../../link/docker-compose/ssh_key.pem'),
      'utf8',
    );

    await prisma.connection.create({
      data: {
        database: 'postgres_db',
        dbUser: 'postgres',
        engine: 'postgres',
        host: 'postgres',
        name: 'postgres_db SSH with key',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 5432,
        schema: 'public',
        sshHost: 'localhost',
        sshPort: 2222,
        sshPrivateKey: sshKey,
        sshUsePrivateKey: true,
        sshUser: 'root',
      },
    });

    await prisma.connection.create({
      data: {
        database: 'mysql_db',
        dbUser: 'root',
        engine: 'mysql',
        host: 'mysql',
        name: 'mysql_db SSH with key',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 3306,
        schema: 'mysql_db',
        sshHost: 'localhost',
        sshPort: 2222,
        sshPrivateKey: sshKey,
        sshUsePrivateKey: true,
        sshUser: 'root',
      },
    });

    const sshKeyWithPassphrase = fs.readFileSync(
      path.join(__dirname, '../../../link/docker-compose/ssh_key_with_passphrase.pem'),
      'utf8',
    );

    await prisma.connection.create({
      data: {
        database: 'postgres_db',
        dbUser: 'postgres',
        engine: 'postgres',
        host: 'postgres',
        name: 'postgres_db SSH with key and passphrase',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 5432,
        schema: 'public',
        sshHost: 'localhost',
        sshPort: 2223,
        sshPrivateKey: sshKeyWithPassphrase,
        sshPrivateKeyPassphrase: 'testpassphrase',
        sshUsePrivateKey: true,
        sshUser: 'root',
      },
    });

    await prisma.connection.create({
      data: {
        database: 'mysql_db',
        dbUser: 'root',
        engine: 'mysql',
        host: 'mysql',
        name: 'mysql_db SSH with key and passphrase',
        user: {
          connect: {
            email: 'test@dabase.dev',
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 3306,
        schema: 'mysql_db',
        sshHost: 'localhost',
        sshPort: 2223,
        sshPrivateKey: sshKeyWithPassphrase,
        sshPrivateKeyPassphrase: 'testpassphrase',
        sshUsePrivateKey: true,
        sshUser: 'root',
      },
    });

    await prisma.connection.create({
      data: {
        database: 'postgres_db',
        dbUser: 'postgres',
        engine: 'postgres',
        host: 'postgres',
        name: 'postgres_db SSH with password',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 5432,
        schema: 'public',
        sshHost: 'localhost',
        sshPort: 2224,
        sshPassword: 'password',
        sshUser: 'root',
      },
    });

    await prisma.connection.create({
      data: {
        database: 'mysql_db',
        dbUser: 'root',
        engine: 'mysql',
        host: 'mysql',
        name: 'mysql_db SSH with password',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'password',
        port: 3306,
        schema: 'mysql_db',
        sshHost: 'localhost',
        sshPort: 2224,
        sshPassword: 'password',
        sshUser: 'root',
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
            email: userEmail,
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
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: '',
        port: 5432,
        schema: 'public',
        sshHost: 'bastion.dabase.dev',
        sshPort: 22,
        sshUsePrivateKey: true,
        sshUser: 'ec2-user',
      },
    });

    await prisma.connection.create({
      data: {
        database: 'pfmegrnargs',
        dbUser: 'reader',
        engine: 'postgres',
        host: 'hh-pgsql-public.ebi.ac.uk',
        name: 'RNAcentral',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: 'NWDMCE5xdipIjRrp',
        port: 5432,
        schema: 'rnacen',
      },
    });

    await prisma.connection.create({
      data: {
        database: 'Rfam',
        dbUser: 'rfamro',
        engine: 'mysql',
        host: 'mysql-rfam-public.ebi.ac.uk',
        name: 'Rfam',
        user: {
          connect: {
            email: userEmail,
          },
        },
        encryptCredentials: false,
        password: '',
        port: 4497,
      },
    });
  };

  await createConnections(user.email);
  await createConnections(plusUser.email);

  console.info('Seeding complete.');
})();
