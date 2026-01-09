export class ConnectorNotFoundError extends Error {
  public static readonly code = 'CONNECTOR_NOT_FOUND';

  constructor() {
    super('Connector not found');
    this.name = ConnectorNotFoundError.code;
  }
}
