import type { Connector } from './types';

export const disconnect = async (connector: Connector) => {
  if ('mysqlClient' in connector) {
    await connector.mysqlClient.$disconnect();
  } else if ('postgresPool' in connector) {
    await connector.postgresPool.end();
  } else {
    throw new Error('Unsupported connector type');
  }

  await connector.sshTunnel?.shutdown();
};
