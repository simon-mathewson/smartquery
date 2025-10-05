import { createContext } from 'react';
import type { LinkApiClient } from './client';

export type LinkApiContextType = LinkApiClient;

export const LinkApiContext = createContext<LinkApiContextType | null>(null);

LinkApiContext.displayName = 'LinkApiContext';
