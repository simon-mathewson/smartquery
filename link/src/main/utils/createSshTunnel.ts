import { SSHConnection } from 'node-ssh-forward';
import findFreePorts from 'find-free-ports';

import type { Connection } from '../types';

export const createSshTunnel = async (connection: Connection) => {
  const { host, port, ssh } = connection;

  const sshLocalHost = 'localhost';
  const [sshLocalPort] = await findFreePorts(1, { startPort: 49152 });

  const sshTunnel = new SSHConnection({
    endHost: ssh.host,
    endPort: ssh.port,
    password: ssh.password,
    privateKey: ssh.privateKey,
    username: ssh.user,
  });

  await sshTunnel.forward({
    fromPort: sshLocalPort,
    toHost: host,
    toPort: port,
  });

  return { sshLocalHost, sshLocalPort, sshTunnel };
};
