import { sql } from '@codemirror/lang-sql';
import { githubLightInit, githubDarkInit } from '@uiw/codemirror-theme-github';
import type { ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import React, { useMemo } from 'react';
import './styles.css';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ThemeContext } from '~/content/theme/Context';
import { themes } from '../../../../tailwind.config';

export type CodeEditorProps = {
  editorProps?: ReactCodeMirrorProps;
  editorRef?: React.RefObject<ReactCodeMirrorRef>;
  hideLineNumbers?: boolean;
  language?: 'json' | 'sql';
  large?: boolean;
  onChange?: (value: string) => void;
};

const commonOptions = {
  background: 'transparent',
  fontFamily: 'Fira Mono, monospace',
  gutterBackground: 'transparent',
} as const;

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { editorProps, editorRef, hideLineNumbers, language, large, onChange } = props;

  const { mode } = useDefinedContext(ThemeContext);

  const theme = useMemo(
    () =>
      mode === 'light'
        ? githubLightInit({
            settings: {
              ...commonOptions,
              gutterBorder: themes.light.border,
              lineHighlight: '#0000000A',
              selection: `${themes.light.primary}50`,
              selectionMatch: `${themes.light.primary}25`,
            },
          })
        : githubDarkInit({
            settings: {
              ...commonOptions,
              gutterBorder: themes.dark.border,
              lineHighlight: '#FFFFFF0A',
              selection: `${themes.dark.primary}50`,
              selectionMatch: `${themes.dark.primary}25`,
            },
          }),
    [mode],
  );

  const extensions = [EditorView.lineWrapping];
  if (language === 'sql') {
    extensions.push(sql());
  } else if (language === 'json') {
    extensions.push(json());
  }

  return (
    <CodeMirror
      {...editorProps}
      basicSetup={{
        autocompletion: false,
        foldGutter: false,
        lineNumbers: !hideLineNumbers,
      }}
      className={large ? 'cm-min-height-large' : 'cm-min-height-small'}
      extensions={extensions}
      onChange={(sql) => onChange?.(sql)}
      onKeyDown={(event) => {
        // Prevent "Tab" from moving focus to the next element.
        if (event.key === 'Tab') {
          event.stopPropagation();
        }
      }}
      ref={editorRef}
      theme={theme}
    />
  );
};
