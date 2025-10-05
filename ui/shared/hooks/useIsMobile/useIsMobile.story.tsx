import React from 'react';
import { useIsMobile } from './useIsMobile';

export type UseIsMobileStoryProps = {
  onMobileChange?: (isMobile: boolean) => void;
};

export const UseIsMobileStory: React.FC<UseIsMobileStoryProps> = ({ onMobileChange }) => {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    onMobileChange?.(isMobile);
  }, [isMobile, onMobileChange]);

  return null;
};
