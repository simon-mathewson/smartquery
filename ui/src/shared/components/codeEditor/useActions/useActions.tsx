import { DataObject } from '@mui/icons-material';
import { includes } from 'lodash';
import type { editor } from 'monaco-editor';
import { useCallback, useEffect } from 'react';
import { assert } from 'ts-essentials';
import { formatJson, isValidJson } from '~/shared/utils/json/json';
import type { ButtonProps } from '../../button/Button';
import type { CodeEditorProps } from '../CodeEditor';

export const useActions = (props: {
  editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
  editorProps: CodeEditorProps;
  isInitialized: boolean;
  setActions: (actions: ButtonProps[]) => void;
}) => {
  const {
    editorRef,
    editorProps: { readOnly, language, value, getActions },
    isInitialized,
    setActions,
  } = props;

  const buildActions = useCallback(async () => {
    assert(editorRef.current);

    const actionList: ButtonProps[] = [];

    if (!readOnly && includes(['sql', 'json', 'sqlite', 'mysql', 'postgres'], language)) {
      const disabled = !value || (language === 'json' && !isValidJson(value));

      const { format: formatSql } = await import('sql-formatter');

      actionList.push({
        htmlProps: {
          disabled,
          onClick: () => {
            if (!editorRef.current) return;

            switch (language) {
              case 'json':
                editorRef.current.setValue(formatJson(value!));
                break;
              case 'mysql':
              case 'postgres':
              case 'sqlite':
              case 'sql':
                editorRef.current.setValue(formatSql(value!));
                break;
              default:
                break;
            }
          },
        },
        icon: <DataObject />,
        tooltip: language === 'json' ? `Format${disabled ? ' (JSON invalid)' : ''}` : 'Format',
      });
    }

    if (getActions && editorRef.current) {
      actionList.push(...getActions(editorRef.current));
    }

    setActions(actionList);
  }, [editorRef, getActions, language, readOnly, setActions, value]);

  useEffect(() => {
    if (isInitialized) {
      void buildActions();
    }
  }, [isInitialized, buildActions]);
};
