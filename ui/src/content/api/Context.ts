import { createContext } from 'react';
import type { apiClient } from './client';

export const ApiContext = createContext<typeof apiClient | null>(null);
