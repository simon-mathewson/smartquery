import React, { useEffect, useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { githubLightInit } from '@uiw/codemirror-theme-github';
import { Button } from '~/components/shared/Button/Button';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import { GlobalContext } from '~/contexts/GlobalContext';
import './styles.css';
import { Send } from '@mui/icons-material';
import { Query as QueryType } from '../../../types';
import colors from 'tailwindcss/colors';

export type EditorProps = {
  query: QueryType;
};

export const Editor: React.FC<EditorProps> = (props) => {
  const { query } = props;

  const { setQueries } = useDefinedContext(GlobalContext);

  const [value, setValue] = useState(query.sql ?? '');

  const theme = githubLightInit({
    settings: {
      background: 'transparent',
      fontFamily: 'Fira Mono, monospace',
      gutterBackground: colors.gray[100],
      gutterBorder: '#eee',
      lineHighlight: `${colors.blue[500]}11`,
      selection: colors.blue[200],
      selectionMatch: colors.blue[100],
    },
  });

  const editorRef = React.useRef<ReactCodeMirrorRef>(null);

  const getContentEl = () => editorRef.current?.editor?.querySelector('.cm-content');

  const submitQuery = () => {
    setQueries((column) =>
      column.map((row) =>
        row.map((q) =>
          q.id === query.id
            ? {
                id: query.id,
                sql: getContentEl()?.textContent ?? undefined,
              }
            : q,
        ),
      ),
    );
  };

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
  }, []);

  return (
    <div className="px-2 pb-2">
      <div className="grid w-full gap-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 pt-1">
        <CodeMirror
          autoFocus
          basicSetup={{
            autocompletion: false,
          }}
          extensions={[sql()]}
          onChange={(sql) => setValue(sql)}
          ref={editorRef}
          theme={theme}
          value={value}
        />
        <Button
          className="mb-2 ml-auto mr-2 w-36"
          disabled={!value?.trim()}
          icon={<Send />}
          label="Submit"
          onClick={() => submitQuery()}
          variant="primary"
        />
      </div>
    </div>
  );
};
