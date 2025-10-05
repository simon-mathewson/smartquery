import { useEffect, useMemo } from 'react';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const useCopilotSidebar = () => {
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', () => !isMobile);

  const [hasEverBeenOpen, setHasEverBeenOpen] = useStoredState<boolean>(
    'useCopilot.hasEverBeenOpen',
    () => false,
  );

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasEverBeenOpen(true);
    }
  }, [isOpen, setHasEverBeenOpen]);

  return useMemo(
    () => ({ isOpen, setIsOpen, hasEverBeenOpen }),
    [isOpen, setIsOpen, hasEverBeenOpen],
  );
};
