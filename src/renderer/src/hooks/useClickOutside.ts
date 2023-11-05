import React, { useEffect } from 'react';

export const useClickOutside = (props: {
  disabled?: boolean;
  handler: () => void;
  refs: Array<React.MutableRefObject<HTMLElement | null>>;
}) => {
  const { disabled, handler, refs } = props;

  useEffect(() => {
    if (disabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const isClickInsideSomeRef = refs.some(
        (ref) => !ref.current || ref.current.contains(event.target as HTMLElement),
      );

      if (isClickInsideSomeRef) return;

      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [disabled, refs, handler]);
};
