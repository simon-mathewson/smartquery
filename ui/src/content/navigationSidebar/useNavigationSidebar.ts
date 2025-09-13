import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export const useNavigationSidebar = () => {
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);
};
