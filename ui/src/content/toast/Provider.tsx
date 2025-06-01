import type { PropsWithChildren } from 'react';
import { ToastContext } from './Context';
import { useToast } from './useToast';
import { Toast } from './Toast';

export const ToastProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useToast();

  return (
    <ToastContext.Provider value={context}>
      <Toast />
      {children}
    </ToastContext.Provider>
  );
};
