import { Send } from '@mui/icons-material';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { CodeEditor } from '../codeEditor/CodeEditor';
import { getErrorMessage } from './utils';
import { ErrorMessage } from '../errorMessage/ErrorMessage';

export type SqlEditorProps = {
  onChange?: (sql: string) => void;
  onSubmit?: () => Promise<void>;
  value: string;
};

export const SqlEditor: React.FC<SqlEditorProps> = (props) => {
  const { onChange, onSubmit, value } = props;

  const [error, setError] = useState<string | undefined>();

  const editorRef = React.useRef<ReactCodeMirrorRef>(null);

  const getContentEl = () =>
    editorRef.current?.editor?.querySelector<HTMLDivElement>('.cm-content');

  const submitQuery = useCallback(async () => {
    const sql = getContentEl()?.innerText;

    if (!sql) return;

    setError(undefined);

    try {
      await onSubmit?.();
    } catch (error) {
      if (error instanceof Error) {
        setError(getErrorMessage(error));
      }
    }
  }, [onSubmit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        document.activeElement === getContentEl() &&
        event.metaKey &&
        event.key === 'Enter' &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.repeat
      ) {
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
      <div className="grid max-h-[200px] w-full min-w-[560px] gap-1 overflow-auto rounded-lg border border-border bg-background py-1">
        <CodeEditor
          editorProps={{ autoFocus: true, value }}
          editorRef={editorRef}
          language="sql"
          large
          onChange={onChange}
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button
          htmlProps={{
            className: 'ml-auto w-36',
            disabled: !value?.trim(),
            onClick: () => void submitQuery(),
          }}
          icon={<Send />}
          label="Submit"
          variant="filled"
        />
      </div>
    </div>
  );
};
