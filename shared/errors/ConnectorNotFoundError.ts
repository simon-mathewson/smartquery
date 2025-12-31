export class ConnectorNotFoundError extends Error {
  constructor() {
    super('Connector not found');
    this.name = 'CONNECTOR_NOT_FOUND';
  }
}
