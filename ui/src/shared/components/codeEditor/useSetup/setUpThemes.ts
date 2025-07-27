import * as monaco from 'monaco-editor';

// Define custom themes to fix quote color issues
export const setUpThemes = () => {
  monaco.editor.defineTheme('vs-custom', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string', foreground: 'a31515' }, // Dark red for strings in light mode
      { token: 'string.sql', foreground: 'a31515' },
      { token: 'string.json', foreground: 'a31515' },
    ],
    colors: {},
  });

  monaco.editor.defineTheme('vs-dark-custom', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string', foreground: 'ce9178' }, // Light orange for strings in dark mode
      { token: 'string.sql', foreground: 'ce9178' },
      { token: 'string.json', foreground: 'ce9178' },
    ],
    colors: {},
  });
};
