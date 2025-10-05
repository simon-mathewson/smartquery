import { useState, useEffect } from 'react';

const getIsMobile = () => window.innerWidth < 640;

/**
 * Hook that returns true if the current viewport width is below Tailwind's 'sm' breakpoint (640px)
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(getIsMobile());

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(getIsMobile());
    };

    window.addEventListener('resize', updateIsMobile);

    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return isMobile;
};
