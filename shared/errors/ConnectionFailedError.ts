export class ConnectionFailedError extends Error {
  public static readonly code = 'CONNECTION_FAILED';

  constructor() {
    super('Failed to connect to database');
  }
}
