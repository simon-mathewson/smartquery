import * as monaco from 'monaco-editor';
import colors from 'tailwindcss/colors';

export const setUpThemes = () => {
  const stringColor = colors.orange[700];
  const keywordColor = colors.blue[700];
  const typeColor = colors.violet[700];
  const functionColor = colors.amber[700];
  const commentColor = colors.emerald[900];
  const variableColor = colors.fuchsia[700];
  const numberColor = colors.emerald[700];
  const operatorColor = colors.slate[700];

  const stringColorDark = colors.orange[400];
  const keywordColorDark = colors.blue[400];
  const typeColorDark = colors.violet[400];
  const functionColorDark = colors.amber[400];
  const commentColorDark = colors.emerald[600];
  const variableColorDark = colors.fuchsia[400];
  const numberColorDark = colors.emerald[400];
  const operatorColorDark = colors.slate[400];

  monaco.editor.defineTheme('vs-custom', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string', foreground: stringColor },
      { token: 'string.sql', foreground: stringColor },
      { token: 'string.json', foreground: stringColor },
      { token: 'keyword', foreground: keywordColor },
      { token: 'keyword.sql', foreground: keywordColor },
      { token: 'keyword.json', foreground: keywordColor },
      { token: 'type', foreground: typeColor },
      { token: 'type.sql', foreground: typeColor },
      { token: 'type.json', foreground: typeColor },
      { token: 'function', foreground: functionColor },
      { token: 'function.sql', foreground: functionColor },
      { token: 'function.json', foreground: functionColor },
      { token: 'comment', foreground: commentColor },
      { token: 'comment.sql', foreground: commentColor },
      { token: 'comment.json', foreground: commentColor },
      { token: 'variable', foreground: variableColor },
      { token: 'variable.sql', foreground: variableColor },
      { token: 'variable.json', foreground: variableColor },
      { token: 'number', foreground: numberColor },
      { token: 'number.sql', foreground: numberColor },
      { token: 'number.json', foreground: numberColor },
      { token: 'operator', foreground: operatorColor },
      { token: 'operator.sql', foreground: operatorColor },
      { token: 'operator.json', foreground: operatorColor },
    ],
    colors: {},
  });

  monaco.editor.defineTheme('vs-dark-custom', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string', foreground: stringColorDark },
      { token: 'string.sql', foreground: stringColorDark },
      { token: 'string.json', foreground: stringColorDark },
      { token: 'keyword', foreground: keywordColorDark },
      { token: 'keyword.sql', foreground: keywordColorDark },
      { token: 'keyword.json', foreground: keywordColorDark },
      { token: 'type', foreground: typeColorDark },
      { token: 'type.sql', foreground: typeColorDark },
      { token: 'type.json', foreground: typeColorDark },
      { token: 'function', foreground: functionColorDark },
      { token: 'function.sql', foreground: functionColorDark },
      { token: 'function.json', foreground: functionColorDark },
      { token: 'comment', foreground: commentColorDark },
      { token: 'comment.sql', foreground: commentColorDark },
      { token: 'comment.json', foreground: commentColorDark },
      { token: 'variable', foreground: variableColorDark },
      { token: 'variable.sql', foreground: variableColorDark },
      { token: 'variable.json', foreground: variableColorDark },
      { token: 'number', foreground: numberColorDark },
      { token: 'number.sql', foreground: numberColorDark },
      { token: 'number.json', foreground: numberColorDark },
      { token: 'operator', foreground: operatorColorDark },
      { token: 'operator.sql', foreground: operatorColorDark },
      { token: 'operator.json', foreground: operatorColorDark },
    ],
    colors: {},
  });
};
