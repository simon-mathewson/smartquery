import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import React from 'react';
import { ThemeContext } from '~/content/theme/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getIsWindows } from '~/shared/utils/getIsWindows/getIsWindows';
import { AiSuggestionWidget } from './aiSuggestion/widget';
import { AiContext } from '~/content/ai/Context';

export type CodeEditorProps = {
  autoFocus?: boolean;
  hideLineNumbers?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  language?: 'json' | 'sql';
  large?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  submit?: () => void;
  value?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { autoFocus, hideLineNumbers, htmlProps, language, large, onChange, readOnly, value } =
    props;

  const { mode } = useDefinedContext(ThemeContext);

  const ai = useDefinedContext(AiContext);

  return (
    <Editor
      className={classNames(
        '[&_.margin]:!bg-background [&_.monaco-editor-background]:!bg-background [&_.monaco-editor]:!bg-background [&_.monaco-editor]:!outline-none [&_.suggest-widget>.message]:text-[12px]',
        htmlProps?.className,
        {
          '[&_.monaco-editor_.cursors-layer_>_.cursor]:!hidden': readOnly,
        },
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

              if (editor.getValue()) {
                props.submit?.();
              }
            }
          });
        }

        setHeight();

        editor.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

        if (autoFocus) {
          editor.focus();
        }

        if (!readOnly) {
          new AiSuggestionWidget(editor, monaco, ai);
        }
      }}
      options={{
        folding: false,
        glyphMargin: true,
        lineDecorationsWidth: hideLineNumbers ? 0 : 16,
        lineNumbers: hideLineNumbers ? 'off' : undefined,
        lineNumbersMinChars: 2,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        renderLineHighlight: readOnly ? 'none' : 'line',
        renderLineHighlightOnlyWhenFocus: true,
        padding: {
          top: 12,
          bottom: 12,
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
