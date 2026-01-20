import type { PropsWithChildren } from 'react';
import { useMobileNavigation } from './useMobileNavigation';
import { MobileNavigationContext } from './Context';

export const MobileNavigationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const mobileNavigation = useMobileNavigation();

  return (
    <MobileNavigationContext.Provider value={mobileNavigation}>
      {children}
    </MobileNavigationContext.Provider>
  );
};
