import React, { useEffect, useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { githubLightInit } from '@uiw/codemirror-theme-github';
import { Button } from '@renderer/components/shared/Button/Button';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import './styles.css';
import { Send } from '@mui/icons-material';
import { Query as QueryType } from '../../../types';

export type TableProps = {
  query: QueryType;
};

export const QueryEditor: React.FC<TableProps> = (props) => {
  const { query } = props;

  const { setQueries } = useDefinedContext(GlobalContext);

  const [value, setValue] = useState(query.sql ?? '');

  const theme = githubLightInit({
    settings: {
      background: 'transparent',
      gutterBackground: 'transparent',
      fontFamily: 'Fira Mono, monospace',
      gutterBorder: '#eee',
    },
  });

  const editorRef = React.useRef<ReactCodeMirrorRef>(null);

  const getContentEl = () => editorRef.current?.editor?.querySelector('.cm-content');

  const submitQuery = () => {
    setQueries([{ id: query.id, sql: getContentEl()?.textContent ?? undefined }]);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement === getContentEl() && event.metaKey && event.key === 'Enter') {
        event.stopPropagation();
        console.log('submit');
        submitQuery();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="grid max-w-xl gap-4">
      <CodeMirror
        autoFocus
        basicSetup={{}}
        extensions={[sql()]}
        onChange={(sql) => setValue(sql)}
        ref={editorRef}
        theme={theme}
        value={value}
        width="100%"
      />
      <Button
        className="ml-auto w-36"
        disabled={!value}
        icon={<Send />}
        label="Submit"
        onClick={() => submitQuery()}
        variant="primary"
      />
    </div>
  );
};
