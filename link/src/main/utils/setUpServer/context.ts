import type { Clients } from '../../types';

export type Context = { clients: Clients };

export const initialContext: Context = {
  clients: {},
};
