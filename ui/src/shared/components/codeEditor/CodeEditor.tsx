import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import React from 'react';
import { ThemeContext } from '~/content/theme/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getIsWindows } from '~/shared/utils/getIsWindows/getIsWindows';

export type CodeEditorProps = {
  autoFocus?: boolean;
  hideLineNumbers?: boolean;
  language?: 'json' | 'sql';
  large?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  submit?: () => void;
  value?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { autoFocus, hideLineNumbers, language, large, onChange, readOnly, value } = props;

  const { mode } = useDefinedContext(ThemeContext);

  return (
    <Editor
      className={classNames(
        '[&_.margin]:!bg-transparent [&_.monaco-editor-background]:!bg-transparent [&_.monaco-editor]:!bg-transparent [&_.monaco-editor]:!outline-none',
      )}
      defaultLanguage={language}
      onChange={(value) => onChange?.(value ?? '')}
      onMount={(editor, monaco) => {
        const setHeight = () => {
          const contentHeight = Math.max(large ? 80 : 30, editor.getContentHeight());

          editor.getContainerDomNode().style.height = `${contentHeight}px`;

          editor.layout({
            width: editor.getContainerDomNode().clientWidth,
            height: contentHeight,
          });

          setTimeout(() => {
            editor.getContainerDomNode().querySelector('.current-line')?.scrollIntoView();
          });
        };

        editor.onDidContentSizeChange(setHeight);

        if (props.submit) {
          editor.onKeyDown((event) => {
            const isWindows = getIsWindows();

            const { browserEvent } = event;

            if (
              browserEvent.key === 'Enter' &&
              !browserEvent.shiftKey &&
              !browserEvent.altKey &&
              !browserEvent.repeat &&
              ((isWindows && browserEvent.ctrlKey && !browserEvent.metaKey) ||
                (!isWindows && !browserEvent.ctrlKey && browserEvent.metaKey))
            ) {
              browserEvent.stopPropagation();
              props.submit?.();
            }
          });
        }

        setHeight();

        editor.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

        if (autoFocus) {
          editor.focus();
        }
      }}
      options={{
        folding: false,
        fontFamily: 'Fira Mono, monospace',
        glyphMargin: true,
        lineDecorationsWidth: hideLineNumbers ? 0 : 16,
        lineNumbers: hideLineNumbers ? 'off' : undefined,
        lineNumbersMinChars: 2,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        padding: {
          top: large ? 8 : 4,
          bottom: large ? 8 : 4,
        },
        readOnly,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
          vertical: 'hidden',
        },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
      theme={mode === 'light' ? 'vs' : 'vs-dark'}
      value={value}
      wrapperProps={{
        style: { overflow: 'hidden', width: '100%' },
      }}
    />
  );
};
