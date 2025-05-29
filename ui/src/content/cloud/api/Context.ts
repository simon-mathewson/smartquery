import { createContext } from 'react';
import type { CloudApiClient } from './client';

export const CloudApiContext = createContext<CloudApiClient | null>(null);
