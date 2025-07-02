import { Send } from '@mui/icons-material';
import React, { useCallback, useContext, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { CodeEditor } from '../codeEditor/CodeEditor';
import { getErrorMessage } from './utils';
import { ErrorMessage } from '../errorMessage/ErrorMessage';
import { QueryContext } from '~/content/tabs/queries/query/Context';

export type SqlEditorProps = {
  onChange?: (sql: string) => void;
  onSubmit?: () => Promise<void>;
  value: string;
};

export const SqlEditor: React.FC<SqlEditorProps> = (props) => {
  const { onChange, onSubmit, value } = props;

  const query = useContext(QueryContext);

  const [error, setError] = useState<string | undefined>();

  const submitQuery = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      setError(undefined);

      try {
        await onSubmit?.();
      } catch (error) {
        if (error instanceof Error) {
          setError(getErrorMessage(error));
        }
      }
    },
    [onSubmit],
  );

  return (
    <form className="flex flex-col gap-3" onSubmit={submitQuery}>
      <div className="grid max-h-[200px] w-full gap-1 overflow-auto overflow-x-hidden rounded-lg border border-border bg-background pr-2">
        <CodeEditor
          autoFocus
          language="sql"
          large
          onChange={onChange}
          submit={submitQuery}
          value={value}
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button
          htmlProps={{
            className: 'ml-auto w-36',
            disabled: !value?.trim() || query?.query.isLoading,
            type: 'submit',
          }}
          icon={<Send />}
          label="Submit"
          variant="filled"
        />
      </div>
    </form>
  );
};
