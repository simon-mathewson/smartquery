import type { Engine } from '@/connections/types';
import classNames from 'classnames';
import type { editor } from 'monaco-editor';
import React, { useRef, useState } from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import { Loading } from '../loading/Loading';
import './setUpLanguageWorkers';
import { useActions } from './useActions/useActions';
import { useSetup } from './useSetup/useSetup';
import type { SchemaDefinitions } from '~/content/ai/schemaDefinitions/types';

export type CodeEditorProps = {
  autoFocus?: boolean;
  bottomToolbar?: React.ReactNode;
  editorOptions?: editor.IStandaloneEditorConstructionOptions | undefined;
  getActions?: (editor: editor.IStandaloneCodeEditor) => ButtonProps[];
  getSchemaDefinitions?: () => Promise<SchemaDefinitions | null>;
  height?: number;
  hideLineNumbers?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  language?: 'json' | 'sql' | Engine | string;
  large?: boolean;
  maxHeight?: number;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onKeyDown?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  submit?: () => void;
  title?: string;
  value?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { bottomToolbar, htmlProps, large, maxHeight, readOnly, title } = props;

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [actions, setActions] = useState<ButtonProps[]>([]);

  const hasTopToolbar = Boolean(actions.length > 0 || title);

  const { containerRef, hostRef, isInitialized, isLoading } = useSetup({
    editorProps: props,
    editorRef,
    hasTopToolbar,
    hasBottomToolbar: Boolean(bottomToolbar),
  });

  useActions({ editorRef, editorProps: props, isInitialized, setActions });

  return (
    <div
      ref={containerRef}
      className={classNames(
        'pr-2 transition-all ease-in-out [&_.margin]:!bg-background [&_.monaco-editor-background]:!bg-background [&_.monaco-editor]:!bg-background [&_.monaco-editor]:!outline-none [&_.scroll-decoration]:hidden [&_.scrollbar.vertical]:!w-[12px] [&_.scrollbar.vertical_.slider]:!w-[10px] [&_.scrollbar.vertical_.slider]:!rounded-[5px] [&_.scrollbar.vertical_.slider]:!bg-black/10 hover:[&_.scrollbar.vertical_.slider]:!bg-black/20 dark:[&_.scrollbar.vertical_.slider]:!bg-white/5 hover:dark:[&_.scrollbar.vertical_.slider]:!bg-white/10 [&_.sticky-widget]:!bg-background [&_.suggest-widget>.message]:text-[12px]',
        htmlProps?.className,
        {
          '[&_.monaco-editor_.cursors-layer_>_.cursor]:!hidden': readOnly,
          hidden: !isInitialized,
        },
      )}
      style={{
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {isLoading && <Loading size={large ? 'default' : 'small'} />}
      {!isLoading && hasTopToolbar && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex">
          <div
            className={classNames(
              'pointer-events-auto ml-auto flex h-9 items-center gap-3 rounded-bl-[18px] bg-background pr-2 pt-2',
              {
                'pb-1 pl-1': !large,
                'p-2 pb-0': large,
                'w-full': title,
              },
            )}
          >
            {title && (
              <div className="pointer-events-auto truncate pl-2 text-xs font-medium text-textTertiary">
                {title}
              </div>
            )}
            {actions.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button color="secondary" key={index} size="small" {...action} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div
        className="h-full w-full overflow-hidden transition-all ease-in-out"
        onWheelCapture={(event) => {
          if (hostRef.current?.contains(document.activeElement)) {
            return;
          }

          event.stopPropagation();
        }}
        ref={hostRef}
        style={{
          maxHeight: `${maxHeight}px`,
        }}
      />
      {bottomToolbar && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20">
          {bottomToolbar}
        </div>
      )}
    </div>
  );
};
