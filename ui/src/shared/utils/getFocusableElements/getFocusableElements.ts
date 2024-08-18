export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      // Keep in sync with focus style selectors in index.css
      [
        'a:not([aria-disabled="true"]):not(.hidden)',
        'button:not(:disabled):not(.hidden)',
        'input:not(:disabled):not([readonly]):not(.hidden)',
        'textarea:not(:disabled):not([readonly]):not(.hidden)',
        'select:not(:disabled):not(.hidden)',
        'details:not([aria-disabled="true"]):not(.hidden)',
        '[tabindex]:not([aria-disabled="true"]):not([tabindex="-1"]):not(.hidden)',
      ].join(),
    ),
  );
};
