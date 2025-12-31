export class NoLongerConnectedError extends Error {
  constructor() {
    super('No longer connected');
    this.name = 'NO_LONGER_CONNECTED';
  }
}
