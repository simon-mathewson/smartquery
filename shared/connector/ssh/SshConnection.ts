import type { Client, ConnectConfig } from 'ssh2';
import * as net from 'net';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ssh2 = require('ssh2');

interface Options {
  username?: string;
  password?: string;
  privateKey?: string | Buffer;
  passphrase?: string;
  endPort?: number;
  endHost: string;
}

interface ForwardingOptions {
  fromPort: number;
  toPort: number;
  toHost?: string;
}

export class SshConnection {
  private server: net.Server | null = null;
  private connections: Client[] = [];

  constructor(private options: Options) {
    if (!options.endPort) {
      this.options.endPort = 22;
    }
  }

  public async shutdown() {
    for (const connection of this.connections) {
      connection.removeAllListeners();
      connection.end();
    }
    return new Promise<void>((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            return reject(error);
          }
          return resolve();
        });
      }
      return resolve();
    });
  }

  private async connect(): Promise<Client> {
    const connection = new ssh2.Client();
    return new Promise<Client>((resolve, reject) => {
      const options: ConnectConfig = {
        host: this.options.endHost,
        port: this.options.endPort,
        username: this.options.username,
        password: this.options.password,
        privateKey: this.options.privateKey,
        passphrase: this.options.passphrase,
      };

      connection.on('ready', () => {
        this.connections.push(connection);
        return resolve(connection);
      });

      connection.on('error', (error: unknown) => {
        reject(error);
      });

      try {
        connection.connect(options);
      } catch (error) {
        reject(error);
      }
    });
  }

  async forward(options: ForwardingOptions) {
    const connection = await this.connect();
    return new Promise<void>((resolve, reject) => {
      this.server = net
        .createServer((socket) => {
          connection.forwardOut(
            'localhost',
            options.fromPort,
            options.toHost || 'localhost',
            options.toPort,
            (error, stream) => {
              if (error) {
                return reject(error);
              }
              socket.pipe(stream);
              stream.pipe(socket);
            },
          );
        })
        .listen(options.fromPort, 'localhost', () => {
          return resolve();
        });
    });
  }
}
