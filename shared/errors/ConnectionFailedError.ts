export class ConnectionFailedError extends Error {
  constructor() {
    super('Connection failed');
    this.name = 'CONNECTION_FAILED';
  }
}
