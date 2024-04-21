import * as net from 'node:net';

export const START_PORT = 49152;
export const END_PORT = 65535;

export const findAvailablePort = (checkPort = START_PORT): Promise<number> =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.on('error', (error) => {
      if ('code' in error && error.code === 'EADDRINUSE') {
        if (checkPort === END_PORT) {
          throw new Error('No available ports');
        }

        return findAvailablePort(checkPort + 1);
      }
      throw error;
    });

    server.listen(checkPort, () => {
      server.close(() => {
        resolve(checkPort);
      });
    });
  });
