import type { PropsWithChildren } from 'react';
import { ToastContext } from './Context';
import { useToast } from './useToast';
import { Toast } from './Toast';

export const ToastProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useToast();

  const { queue } = context;
  const currentToast = queue.at(0);

  return (
    <ToastContext.Provider value={context}>
      {currentToast && <Toast {...currentToast} />}
      {children}
    </ToastContext.Provider>
  );
};
