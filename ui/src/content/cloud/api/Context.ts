import { createContext } from 'react';
import type { CloudApiClient } from './client';

export type CloudApiContextType = CloudApiClient;

export const CloudApiContext = createContext<CloudApiContextType | null>(null);

CloudApiContext.displayName = 'CloudApiContext';
