import { SSHConnection } from 'node-ssh-forward';
import findFreePorts from 'find-free-ports';

import type { RemoteConnection } from '@/types/connection';
import assert from 'assert';

export const createSshTunnel = async (connection: RemoteConnection) => {
  const { host, port, ssh } = connection;

  assert(ssh);

  const sshLocalHost = 'localhost';
  const [sshLocalPort] = await findFreePorts(1, { startPort: 49152 });

  const sshTunnel = new SSHConnection({
    endHost: ssh.host,
    endPort: ssh.port,
    password: ssh.password ?? undefined,
    privateKey: ssh.privateKey ?? undefined,
    username: ssh.user,
  });

  await sshTunnel.forward({
    fromPort: sshLocalPort,
    toHost: host,
    toPort: port,
  });

  return { sshLocalHost, sshLocalPort, sshTunnel };
};
