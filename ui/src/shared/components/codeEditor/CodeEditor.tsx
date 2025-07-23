import Editor from '@monaco-editor/react';
import classNames from 'classnames';
import type { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AiContext } from '~/content/ai/Context';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ThemeContext } from '~/content/theme/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getIsWindows } from '~/shared/utils/getIsWindows/getIsWindows';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import { Loading } from '../loading/Loading';
import { AiSuggestionWidget } from './aiSuggestion/widget';
import { DataObject } from '@mui/icons-material';
import { includes } from 'lodash';
import { formatJson, isValidJson } from '~/shared/utils/json/json';

export type CodeEditorProps = {
  autoFocus?: boolean;
  editorOptions?: editor.IStandaloneEditorConstructionOptions | undefined;
  getActions?: (editor: editor.IStandaloneCodeEditor) => ButtonProps[];
  getAdditionalSystemInstructions?: () => Promise<string | null>;
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
    getActions,
    getAdditionalSystemInstructions,
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

  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);

  const [actions, setActions] = useState<ButtonProps[]>([]);

  const buildActions = useCallback(async (): Promise<ButtonProps[]> => {
    const actionList: ButtonProps[] = [];

    if (!readOnly && editor && includes(['sql', 'json'], language) && value) {
      const jsonDisabled = language === 'json' && !isValidJson(value);

      const { format: formatSql } = await import('sql-formatter');

      actionList.push({
        htmlProps: {
          disabled: jsonDisabled,
          onClick: () => {
            switch (language) {
              case 'json':
                editor.setValue(formatJson(value));
                break;
              case 'sql':
                editor.setValue(formatSql(value));
                break;
            }
          },
        },
        icon: <DataObject />,
        tooltip: `Format${jsonDisabled ? ' (JSON invalid)' : ''}`,
      });
    }

    if (getActions && editor) {
      actionList.push(...getActions(editor));
    }

    return actionList;
  }, [editor, getActions, language, readOnly, value]);

  useEffect(() => {
    void buildActions().then(setActions);
  }, [buildActions]);

  const initialHeight = large ? 80 : 30;
  const fontSize = 12;
  const lineHeight = 18;
  const paddingTop = (() => {
    if (actions.length) return 0;

    return large ? 12 : 6;
  })();
  const paddingBottom = large ? 12 : 6;

  return (
    <>
      {actions.length > 0 && (
        <div className="pointer-events-none sticky top-0 z-10 flex justify-end">
          <div
            className={classNames(
              'pointer-events-auto flex h-max justify-end gap-2 rounded-bl-[18px] bg-background pt-2',
              {
                'pb-1 pl-1 pr-2': !large,
                'p-2 pb-0 pr-0': large,
              },
            )}
          >
            {actions.map((action, index) => (
              <Button color="secondary" key={index} size="small" {...action} />
            ))}
          </div>
        </div>
      )}
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
          setEditor(editor);

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
              getAdditionalSystemInstructions,
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
    </>
  );
};
