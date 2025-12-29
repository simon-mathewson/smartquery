export class NoLongerConnectedError extends Error {
  public static readonly name = 'NO_LONGER_CONNECTED';

  public static readonly message = 'No longer connected';

  constructor() {
    super(NoLongerConnectedError.message);
    this.name = NoLongerConnectedError.name;
  }
}
