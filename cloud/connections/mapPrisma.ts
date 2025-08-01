import type { Connection } from '@/connections/types';
import type { Connection as DbConnection, Prisma } from '~/prisma/generated';
import type { CreateConnectionInput } from './schemas';
import { omit } from 'lodash';

export const mapPrismaToConnection = (c: DbConnection) => {
  const credentialStorage = (() => {
    if (c.encryptCredentials) {
      return 'encrypted';
    }

    return c.password === null ? 'alwaysAsk' : 'plain';
  })();

  return {
    ...c,
    credentialStorage,
    engine: c.engine,
    host: c.host!,
    port: c.port!,
    schema: c.schema ?? undefined,
    ssh:
      c.sshHost && c.sshPort && c.dbUser
        ? {
            host: c.sshHost,
            password: c.sshPassword ?? (c.sshUsePrivateKey ? undefined : null),
            port: c.sshPort,
            privateKey: c.sshPrivateKey ?? (c.sshUsePrivateKey ? null : undefined),
            privateKeyPassphrase:
              c.sshPrivateKeyPassphrase ?? (c.useSshPrivateKeyPassphrase ? null : undefined),
            user: c.sshUser!,
          }
        : null,
    storageLocation: 'cloud',
    type: 'remote',
    user: c.dbUser!,
  } satisfies Connection;
};

export const mapConnectionToPrisma = (
  c: CreateConnectionInput['connection'],
): Prisma.ConnectionCreateWithoutUserInput => ({
  ...omit(c, 'credentialStorage', 'ssh', 'storageLocation', 'type', 'user'),
  dbUser: c.user,
  encryptCredentials: c.credentialStorage === 'encrypted',
  ...(c.ssh
    ? {
        sshHost: c.ssh.host,
        sshPassword: c.ssh.password,
        sshPort: c.ssh.port,
        sshPrivateKey: c.ssh.privateKey,
        sshPrivateKeyPassphrase: c.ssh.privateKeyPassphrase,
        sshUsePrivateKey: c.ssh.privateKey !== undefined,
        sshUser: c.ssh.user,
        useSshPrivateKeyPassphrase: c.ssh.privateKeyPassphrase !== undefined,
      }
    : null),
});
