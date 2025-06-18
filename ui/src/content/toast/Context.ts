import { createContext } from 'react';
import type { useToast } from './useToast';

export const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

ToastContext.displayName = 'ToastContext';
