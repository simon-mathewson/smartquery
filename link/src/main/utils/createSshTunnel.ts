import { NodeSSH } from 'node-ssh';

import { findAvailablePort } from './findAvailablePort';
import type { Connection } from '../types';

export const createSshTunnel = async (connection: Connection) => {
  const { host, port, ssh } = connection;

  const sshTunnel = new NodeSSH();

  const sshLocalHost = 'localhost';
  const sshLocalPort = await findAvailablePort();

  await sshTunnel.connect({
    host: ssh.host,
    port: ssh.port,
    username: ssh.user,
    password: ssh.password,
    privateKey: ssh.privateKey,
  });

  await sshTunnel.forwardOut('localhost', sshLocalPort, host, port);

  return { sshLocalHost, sshLocalPort, sshTunnel };
};
