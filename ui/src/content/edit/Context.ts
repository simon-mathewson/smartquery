import { createContext } from 'react';
import type { useEdit } from './useEdit';

export const EditContext = createContext<ReturnType<typeof useEdit> | null>(null);
