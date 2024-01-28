import { useLayoutEffect, useRef, useState } from 'react';

export type UseAnimateProps = {
  show: boolean;
};

export const useAnimate = (props: UseAnimateProps) => {
  const { show } = props;

  const contentRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    if (show && !isVisible) {
      setIsVisible(true);
      return () => {};
    }

    const content = contentRef.current;

    if (!content) return () => {};

    content.style.transition = 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)';
    content.style.display = 'initial';
    content.style.pointerEvents = 'none';

    const originalOpacity = content.style.opacity;
    const originalTransform = content.style.transform;
    const offOpacity = '0';
    const offTransform = 'translateY(-16px)';

    if (show && isVisible) {
      content.style.opacity = offOpacity;
      content.style.transform = [originalTransform, offTransform].filter(Boolean).join(' ');

      const timeoutId = setTimeout(() => {
        content.style.opacity = originalOpacity;
        content.style.pointerEvents = 'all';
        content.style.transform = originalTransform;
      });

      return () => {
        clearTimeout(timeoutId);
      };
    }

    if (!show) {
      content.style.opacity = offOpacity;
      content.style.pointerEvents = 'none';
      content.style.transform = [originalTransform, offTransform].filter(Boolean).join(' ');

      const timeoutId = setTimeout(() => {
        setIsVisible(false);

        content.style.display = 'none';
      }, 400);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    return () => {};
  }, [show, isVisible]);

  return { contentRef, isVisible };
};
