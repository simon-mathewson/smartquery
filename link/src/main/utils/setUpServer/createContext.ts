import type { Clients } from '../../types';

export const context: { clients: Clients } = {
  clients: {},
};

export const createContext = () => context;
