import { createContext } from 'react';
import type { cloudApi } from './client';

export type CloudApiContextType = typeof cloudApi;

export const CloudApiContext = createContext<CloudApiContextType | null>(null);

CloudApiContext.displayName = 'CloudApiContext';
