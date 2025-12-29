export class ConnectorNotFoundError extends Error {
  public static readonly name = 'CONNECTOR_NOT_FOUND';

  public static readonly message = 'Connector not found';

  constructor() {
    super(ConnectorNotFoundError.message);
    this.name = ConnectorNotFoundError.name;
  }
}
