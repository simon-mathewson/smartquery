import { useCallback, useMemo } from 'react';

export const useKeyboardNavigation = () => {
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      !event.target ||
      !(event.target instanceof HTMLElement) ||
      !(event.currentTarget instanceof HTMLElement)
    ) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (event.target === event.currentTarget) {
        const firstEl = event.currentTarget.firstElementChild;

        if (firstEl && firstEl instanceof HTMLElement) {
          firstEl.focus();
        }

        return;
      }

      const nextEl = event.target.nextElementSibling;

      if (nextEl && nextEl instanceof HTMLElement) {
        nextEl.focus();
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      const prevEl = event.target.previousElementSibling;

      if (prevEl && prevEl instanceof HTMLElement) {
        prevEl.focus();
      }
    }

    if (event.key === 'Home') {
      event.preventDefault();

      const firstEl = event.currentTarget?.firstElementChild;

      if (firstEl && firstEl instanceof HTMLElement) {
        firstEl.focus();
      }
    }

    if (event.key === 'End') {
      event.preventDefault();

      const lastEl = event.currentTarget?.lastElementChild;

      if (lastEl && lastEl instanceof HTMLElement) {
        lastEl.focus();
      }
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      event.target.click();
    }

    if (event.key === 'Escape') {
      event.preventDefault();

      event.currentTarget.blur();
    }

    // Focus first item starting with the pressed key
    if (
      /^[\p{L}|\p{N}]$/u.test(event.key) &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey
    ) {
      event.preventDefault();

      const firstEl = Array.from(event.currentTarget.children).find((el) => {
        if (!(el instanceof HTMLElement)) {
          return false;
        }

        return el.textContent?.trim().toLowerCase().startsWith(event.key.toLowerCase());
      });

      if (firstEl && firstEl instanceof HTMLElement) {
        firstEl.focus();
      }
    }
  }, []);

  return useMemo(() => ({ onKeyDown }), [onKeyDown]);
};
