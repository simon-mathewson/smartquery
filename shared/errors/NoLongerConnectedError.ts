export class NoLongerConnectedError extends Error {
  public static readonly code = 'NO_LONGER_CONNECTED';

  constructor() {
    super('No longer connected');
    this.name = NoLongerConnectedError.code;
  }
}
