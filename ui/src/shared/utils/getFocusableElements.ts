export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        'a:not([aria-disabled="true"])',
        'button:not(:disabled)',
        'input:not(:disabled):not([readonly])',
        'textarea:not(:disabled):not([readonly])',
        'select:not(:disabled)',
        'details:not(:disabled)',
        '[tabindex]:not(:disabled):not([tabindex="-1"])',
      ].join(),
    ),
  );
};
