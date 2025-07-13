import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { ThemeContext } from '~/content/theme/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getIsWindows } from '~/shared/utils/getIsWindows/getIsWindows';
import { AiSuggestionWidget } from './aiSuggestion/widget';
import { AiContext } from '~/content/ai/Context';
import type { editor } from 'monaco-editor';
import { AnalyticsContext } from '~/content/analytics/Context';
import { Loading } from '../loading/Loading';

export type CodeEditorProps = {
  autoFocus?: boolean;
  editorOptions?: editor.IStandaloneEditorConstructionOptions | undefined;
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
  const {
    autoFocus,
    editorOptions,
    hideLineNumbers,
    htmlProps,
    language,
    large,
    onChange,
    readOnly,
    value,
  } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { mode } = useDefinedContext(ThemeContext);
  const ai = useDefinedContext(AiContext);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const initialHeight = large ? 80 : 30;
  const fontSize = 12;
  const lineHeight = 18;
  const paddingTop = large ? 12 : 6;
  const paddingBottom = large ? 12 : 6;

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
      loading={<Loading size={large ? 'default' : 'small'} />}
      onChange={(value) => onChange?.(value ?? '')}
      onMount={(editor, monaco) => {
        const setHeight = () => {
          const contentHeight = Math.max(initialHeight, editor.getContentHeight());

          const wrapper = wrapperRef.current;

          if (wrapper) {
            wrapper.style.height = `${contentHeight}px`;
          }

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
          new AiSuggestionWidget(
            editor,
            monaco,
            ai,
            track,
            wrapperRef,
            lineHeight,
            paddingTop,
            fontSize,
            language,
          );
        }
      }}
      options={{
        folding: false,
        fontSize,
        glyphMargin: true,
        lineDecorationsWidth: hideLineNumbers ? 0 : 16,
        lineHeight,
        lineNumbers: hideLineNumbers ? 'off' : undefined,
        lineNumbersMinChars: 2,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        renderLineHighlight: readOnly ? 'none' : 'line',
        renderLineHighlightOnlyWhenFocus: true,
        padding: {
          top: paddingTop,
          bottom: paddingBottom,
        },
        readOnly,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
          vertical: 'hidden',
        },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        ...(editorOptions ?? {}),
      }}
      theme={mode === 'light' ? 'vs' : 'vs-dark'}
      value={value}
      wrapperProps={{
        ref: wrapperRef,
        style: {
          overflow: 'hidden',
          width: '100%',

          // Needed for loading indicator
          height: initialHeight,
          position: 'relative',
        },
      }}
    />
  );
};
