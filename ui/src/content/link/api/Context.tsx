import { createContext } from 'react';
import type { LinkApiClient } from './client';

export const LinkApiContext = createContext<LinkApiClient | null>(null);
