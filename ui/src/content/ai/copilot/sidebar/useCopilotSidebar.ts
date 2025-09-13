import { useEffect, useMemo } from 'react';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const useCopilotSidebar = () => {
  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  return useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);
};
