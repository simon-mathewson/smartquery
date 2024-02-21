import { sql } from '@codemirror/lang-sql';
import { githubLightInit } from '@uiw/codemirror-theme-github';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import React from 'react';
import colors from 'tailwindcss/colors';
import './styles.css';

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

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { autoFocus, editorRef, hideLineNumbers, language, large, onChange, placeholder, value } =
    props;

  const theme = githubLightInit({
    settings: {
      background: 'transparent',
      fontFamily: 'Fira Mono, monospace',
      gutterBackground: colors.gray[50],
      gutterBorder: '#eee',
      lineHighlight: `${colors.blue[500]}11`,
      selection: colors.blue[200],
      selectionMatch: colors.blue[100],
    },
  });

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
