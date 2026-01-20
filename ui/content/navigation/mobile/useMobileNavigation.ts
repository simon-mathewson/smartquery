import { useMemo, useState } from 'react';

export type OverlayPage = 'connections' | 'queries' | 'settings' | 'copilot' | null;

export const useMobileNavigation = () => {
  const [overlayPage, setOverlayPage] = useState<OverlayPage>(null);

  return useMemo(
    () => ({
      overlayPage,
      setOverlayPage,
    }),
    [overlayPage],
  );
};
