import { createContext } from 'react';
import type { linkApiClient } from './client';

export const LinkApiContext = createContext<typeof linkApiClient | null>(null);
