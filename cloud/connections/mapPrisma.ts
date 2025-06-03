import { Connection } from '@/types/connection';
import { Connection as DbConnection, Prisma } from '~/prisma/generated';
import { CreateConnectionInput } from './schemas';
import { omit } from 'lodash';

export const mapPrismaToConnection = (c: DbConnection) => {
  return (
    c.engine === 'sqlite'
      ? { ...c, engine: c.engine, storageLocation: 'cloud', type: 'file' }
      : {
          ...c,
          credentialStorage: c.encryptCredentials ? 'encrypted' : 'plain',
          engine: c.engine,
          host: c.host!,
          port: c.port!,
          schema: c.schema ?? undefined,
          ssh:
            c.sshHost && c.sshPort && c.dbUser
              ? {
                  host: c.sshHost,
                  password: c.sshPassword,
                  port: c.sshPort,
                  privateKey: c.sshPrivateKey,
                  user: c.dbUser,
                }
              : null,
          storageLocation: 'cloud',
          type: 'remote',
          user: c.dbUser!,
        }
  ) satisfies Connection;
};

export const mapConnectionToPrisma = (
  c: CreateConnectionInput,
): Prisma.ConnectionCreateWithoutUserInput => ({
  ...omit(c, 'id', 'ssh', 'storageLocation', 'type', 'user'),
  ...(c.type === 'remote'
    ? {
        dbUser: c.user,
        encryptCredentials: c.credentialStorage === 'encrypted',
        ...(c.ssh
          ? {
              sshHost: c.ssh.host,
              sshPassword: c.ssh.password,
              sshPort: c.ssh.port,
              sshPrivateKey: c.ssh.privateKey,
              sshUser: c.ssh.user,
            }
          : null),
      }
    : {
        encryptCredentials: false,
      }),
});
