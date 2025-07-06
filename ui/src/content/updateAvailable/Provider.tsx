import type { PropsWithChildren } from 'react';
import { UpdateAvailableContext } from './Context';
import { useUpdateAvailable } from './useUpdateAvailable';

export const UpdateAvailableProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useUpdateAvailable();

  return (
    <UpdateAvailableContext.Provider value={context}>{children}</UpdateAvailableContext.Provider>
  );
};
