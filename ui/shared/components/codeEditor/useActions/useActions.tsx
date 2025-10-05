import { DataObject } from '@mui/icons-material';
import { includes } from 'lodash';
import type { editor } from 'monaco-editor';
import { useCallback, useEffect } from 'react';
import { assert } from 'ts-essentials';
import { formatJson, isValidJson } from '~/shared/utils/json/json';
import type { ButtonProps } from '../../button/Button';
import type { CodeEditorProps } from '../CodeEditor';
import { formatSql } from '~/shared/utils/sql/sql';

export const useActions = (props: {
  editorProps: CodeEditorProps;
  editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
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

      actionList.push({
        htmlProps: {
          disabled,
          onClick: async () => {
            if (!editorRef.current) return;

            switch (language) {
              case 'json':
                editorRef.current.setValue(formatJson(value!));
                break;
              case 'mysql':
              case 'postgres':
              case 'sqlite':
              case 'sql':
                editorRef.current.setValue(await formatSql(value!, language));
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
