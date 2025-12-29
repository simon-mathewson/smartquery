import { ConnectionFailedError } from './ConnectionFailedError';
import { ConnectorNotFoundError } from './ConnectorNotFoundError';
import { NoLongerConnectedError } from './NoLongerConnectedError';

export const errors = [ConnectionFailedError, ConnectorNotFoundError, NoLongerConnectedError];
