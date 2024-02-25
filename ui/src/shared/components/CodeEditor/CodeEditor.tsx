import { sql } from '@codemirror/lang-sql';
import { githubLightInit, githubDarkInit } from '@uiw/codemirror-theme-github';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import React, { useMemo } from 'react';
import './styles.css';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ThemeContext } from '~/content/theme/Context';
import { themes } from '../../../../tailwind.config';

export type CodeEditorProps = {
  autoFocus?: boolean;
  editorRef?: React.RefObject<ReactCodeMirrorRef>;
  hideLineNumbers?: boolean;
  language: 'json' | 'sql';
  large?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  value: string | undefined;
};

const commonOptions = {
  background: 'transparent',
  fontFamily: 'Fira Mono, monospace',
  gutterBackground: 'transparent',
} as const;

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { autoFocus, editorRef, hideLineNumbers, language, large, onChange, placeholder, value } =
    props;

  const { mode } = useDefinedContext(ThemeContext);

  const theme = useMemo(
    () =>
      mode === 'light'
        ? githubLightInit({
            settings: {
              ...commonOptions,
              gutterBorder: themes.light.border,
              lineHighlight: `${themes.light.primary}10`,
              selection: `${themes.light.primary}50`,
              selectionMatch: `${themes.light.primary}25`,
            },
          })
        : githubDarkInit({
            settings: {
              ...commonOptions,
              gutterBorder: themes.dark.border,
              lineHighlight: `${themes.dark.primary}10`,
              selection: `${themes.dark.primary}50`,
              selectionMatch: `${themes.dark.primary}25`,
            },
          }),
    [mode],
  );

  return (
    <CodeMirror
      autoFocus={autoFocus}
      basicSetup={{
        autocompletion: false,
        foldGutter: false,
        lineNumbers: !hideLineNumbers,
      }}
      className={large ? 'cm-min-height-large' : 'cm-min-height-small'}
      extensions={[language === 'sql' ? sql() : json(), EditorView.lineWrapping]}
      onChange={(sql) => onChange?.(sql)}
      placeholder={placeholder}
      ref={editorRef}
      theme={theme}
      value={value}
    />
  );
};
