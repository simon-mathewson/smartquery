import type { inferRouterOutputs } from '@trpc/server';
import type { Connection } from '@/types/connection';
import type { AppRouter } from '../../../../cloud/router';

type CloudConnection = inferRouterOutputs<AppRouter>['connections']['list'][number];

export const mapCloudConnectionToClient = (c: CloudConnection): Connection => {
  return (
    c.engine === 'sqlite'
      ? { ...c, engine: c.engine, storageLocation: 'cloud', type: 'file' }
      : {
          ...c,
          engine: c.engine,
          host: c.host!,
          port: c.port!,
          schema: c.schema ?? undefined,
          ssh:
            c.sshHost && c.sshPort && c.dbUser
              ? {
                  host: c.sshHost,
                  port: c.sshPort,
                  user: c.dbUser,
                  password: c.sshPassword,
                  privateKey: c.sshPrivateKey,
                }
              : null,
          storageLocation: 'cloud',
          type: 'remote',
          user: c.dbUser!,
        }
  ) satisfies Connection;
};
