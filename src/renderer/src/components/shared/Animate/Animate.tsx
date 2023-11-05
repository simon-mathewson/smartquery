import React, { useLayoutEffect, useRef, useState } from 'react';

export type AnimateProps = {
  children: (ref: React.MutableRefObject<HTMLElement | null>) => React.ReactNode;
  show: boolean;
};

export const Animate: React.FC<AnimateProps> = (props) => {
  const { children, show } = props;

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

    const offStyles = {
      opacity: '0',
      transform: 'translateY(-16px)',
    };

    const onStyles = {
      opacity: '1',
      transform: 'translateY(0)',
    };

    if (show && isVisible) {
      Object.assign(content.style, offStyles);

      const timeoutId = setTimeout(() => {
        Object.assign(content.style, onStyles);
      });

      return () => {
        clearTimeout(timeoutId);
      };
    }

    if (!show) {
      Object.assign(content.style, offStyles);

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

  if (!isVisible) return;

  return children(contentRef);
};
