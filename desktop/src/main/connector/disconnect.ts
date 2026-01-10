import type { Connector } from './types';

export const disconnect = async (connector: Connector) => {
  if ('mysqlPool' in connector) {
    await connector.mysqlPool.end();
  } else if ('postgresPool' in connector) {
    await connector.postgresPool.end();
  } else {
    throw new Error('Unsupported connector type');
  }

  await connector.sshTunnel?.shutdown();
};
