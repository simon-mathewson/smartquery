import { createContext } from 'react';
import type { useUpdateAvailable } from './useUpdateAvailable';

export type UpdateAvailableContextType = ReturnType<typeof useUpdateAvailable>;

export const UpdateAvailableContext = createContext<UpdateAvailableContextType | null>(null);

UpdateAvailableContext.displayName = 'UpdateAvailableContext';
