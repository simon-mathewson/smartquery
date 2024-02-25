import { Send } from '@mui/icons-material';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { CodeEditor } from '../CodeEditor/CodeEditor';

export type SqlEditorProps = {
  initialValue?: string;
  onSubmit?: (sql: string) => void;
};

export const SqlEditor: React.FC<SqlEditorProps> = (props) => {
  const { initialValue, onSubmit } = props;

  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  const editorRef = React.useRef<ReactCodeMirrorRef>(null);

  const getContentEl = () =>
    editorRef.current?.editor?.querySelector<HTMLDivElement>('.cm-content');

  const submitQuery = useCallback(() => {
    const sql = getContentEl()?.innerText;

    if (!sql) return;

    onSubmit?.(sql);
  }, [onSubmit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement === getContentEl() && event.metaKey && event.key === 'Enter') {
        event.stopPropagation();
        submitQuery();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [submitQuery]);

  return (
    <div className="bg-background border-border grid w-full min-w-[560px] gap-1 overflow-hidden rounded-lg border pt-1">
      <CodeEditor
        autoFocus
        editorRef={editorRef}
        language="sql"
        large
        onChange={(sql) => setValue(sql)}
        value={value}
      />
      <Button
        className="mb-2 ml-auto mr-2 w-36"
        disabled={!value?.trim()}
        icon={<Send />}
        label="Submit"
        onClick={() => submitQuery()}
        variant="filled"
      />
    </div>
  );
};
