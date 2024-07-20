import { getFocusableElements } from './getFocusableElements';

export const focusFirstControl = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);

  if (
    focusableElements.some((element) => element === document.activeElement || element.autofocus)
  ) {
    return;
  }

  focusableElements[0]?.focus();
};
