import { getFocusableElements } from './getFocusableElements';

export const focusFirstControl = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);

  if (
    focusableElements.some((element) => element === document.activeElement || element.autofocus)
  ) {
    return;
  }

  const elementToFocus =
    focusableElements.find((element) => element.classList.contains('auto-focus')) ??
    focusableElements[0];

  elementToFocus?.focus();
};
