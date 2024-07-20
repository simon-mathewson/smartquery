import { useEffect } from 'react';
import { getFocusableElements } from '~/shared/utils/getFocusableElements';

export type UseKeyboardNavigationProps = {
  isTopLevel: boolean;
  ref: React.MutableRefObject<HTMLDivElement | null>;
};

export const useKeyboardNavigation = (props: UseKeyboardNavigationProps) => {
  const { isTopLevel, ref } = props;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !ref.current || !isTopLevel) return;

      event.preventDefault();

      const focusableElements = getFocusableElements(ref.current);
      const activeElementIndex = focusableElements.findIndex(
        (element) => element === document.activeElement,
      );
      const nextElementIndex = (() => {
        if (event.shiftKey) {
          return activeElementIndex <= 0 ? focusableElements.length - 1 : activeElementIndex - 1;
        }
        return activeElementIndex >= focusableElements.length - 1 ? 0 : activeElementIndex + 1;
      })();

      focusableElements[nextElementIndex].focus();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTopLevel, ref]);
};
