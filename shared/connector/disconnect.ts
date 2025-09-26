import type { Connector } from './types';

export const disconnect = async (connector: Connector) => {
  await connector.prisma.$disconnect();
  await connector.sshTunnel?.shutdown();
};
