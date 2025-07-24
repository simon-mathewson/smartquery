import type { Connector } from '@/connector/types';

export type Context = { connectors: { [connectionId: string]: Connector } };

export const initialContext: Context = {
  connectors: {},
};
