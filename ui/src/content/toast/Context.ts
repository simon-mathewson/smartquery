import { createContext } from 'react';
import type { useToast } from './useToast';

export type ToastContextType = ReturnType<typeof useToast>;

export const ToastContext = createContext<ToastContextType | null>(null);

ToastContext.displayName = 'ToastContext';
