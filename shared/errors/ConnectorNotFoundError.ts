export class ConnectorNotFoundError extends Error {
  public static readonly code = 'CONNECTOR_NOT_FOUND';

  constructor() {
    super(ConnectorNotFoundError.code);
  }
}
