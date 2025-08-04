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
  language?: 'json' | 'sql' | Engine;
  large?: boolean;
  maxHeight?: number;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onKeyDown?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  submit?: () => void;
  value?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { bottomToolbar, htmlProps, large, maxHeight, readOnly } = props;

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [actions, setActions] = useState<ButtonProps[]>([]);

  const { containerRef, hostRef, isInitialized, isLoading } = useSetup({
    editorProps: props,
    editorRef,
    hasActions: actions.length > 0,
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
      {!isLoading && actions.length > 0 && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-end">
          <div
            className={classNames(
              'pointer-events-auto flex h-max justify-end gap-2 rounded-bl-[18px] bg-background pr-2 pt-2',
              {
                'pb-1 pl-1': !large,
                'p-2 pb-0': large,
              },
            )}
          >
            {actions.map((action, index) => (
              <Button color="secondary" key={index} size="small" {...action} />
            ))}
          </div>
        </div>
      )}
      <div
        className="h-full w-full overflow-auto transition-all ease-in-out"
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
