import { Send } from '@mui/icons-material';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { CodeEditor } from '../CodeEditor/CodeEditor';
import { getErrorMessage } from './utils';

export type SqlEditorProps = {
  initialValue?: string;
  onSubmit?: (sql: string) => Promise<void>;
};

export const SqlEditor: React.FC<SqlEditorProps> = (props) => {
  const { initialValue, onSubmit } = props;

  const [value, setValue] = useState('');

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  const editorRef = React.useRef<ReactCodeMirrorRef>(null);

  const getContentEl = () =>
    editorRef.current?.editor?.querySelector<HTMLDivElement>('.cm-content');

  const submitQuery = useCallback(async () => {
    const sql = getContentEl()?.innerText;

    if (!sql) return;

    setError(undefined);

    try {
      await onSubmit?.(sql);
    } catch (error) {
      if (error instanceof Error) {
        setError(getErrorMessage(error));
      }
    }
  }, [onSubmit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement === getContentEl() && event.metaKey && event.key === 'Enter') {
        event.stopPropagation();
        void submitQuery();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [submitQuery]);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-background border-border grid w-full min-w-[560px] gap-1 overflow-hidden rounded-lg border py-1">
        <CodeEditor
          autoFocus
          editorRef={editorRef}
          language="sql"
          large
          onChange={(sql) => setValue(sql)}
          value={value}
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        {error && (
          <div className="text-danger bg-dangerHighlight select-text rounded-lg px-2 py-1 text-xs font-medium leading-normal">
            {error}
          </div>
        )}
        <Button
          className="ml-auto w-36"
          disabled={!value?.trim()}
          icon={<Send />}
          label="Submit"
          onClick={() => void submitQuery()}
          variant="filled"
        />
      </div>
    </div>
  );
};
