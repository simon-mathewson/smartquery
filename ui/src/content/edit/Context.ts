import { createContext } from 'react';
import type { useEdit } from './useEdit';

export type EditContextType = ReturnType<typeof useEdit>;

export const EditContext = createContext<EditContextType | null>(null);

EditContext.displayName = 'EditContext';
