import { getFocusableElements } from './getFocusableElements';

export const autoFocusClass = 'auto-focus';

export const focusFirstControl = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);

  if (
    focusableElements.some((element) => element === document.activeElement || element.autofocus)
  ) {
    return;
  }

  const elementToFocus =
    focusableElements.find((element) => element.classList.contains(autoFocusClass)) ??
    focusableElements[0];

  elementToFocus?.focus();
};
