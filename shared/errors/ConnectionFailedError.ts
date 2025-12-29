export class ConnectionFailedError extends Error {
  public static readonly name = 'CONNECTION_FAILED';

  public static readonly message = 'Connection failed';

  constructor() {
    super(ConnectionFailedError.message);
    this.name = ConnectionFailedError.name;
  }
}
