import { Send } from '@mui/icons-material';
import React, { useCallback, useContext, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { CodeEditor } from '../codeEditor/CodeEditor';
import { getErrorMessage } from './utils';
import { ErrorMessage } from '../errorMessage/ErrorMessage';
import { QueryContext } from '~/content/tabs/queries/query/Context';
import { useSchemaDefinitions } from '~/content/ai/schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { isNotNull } from '~/shared/utils/typescript/typescript';

export type SqlEditorProps = {
  isSubmitDisabled?: boolean;
  onChange?: (sql: string) => void;
  onSubmit?: () => Promise<void>;
  value: string;
};

export const SqlEditor: React.FC<SqlEditorProps> = (props) => {
  const { isSubmitDisabled, onChange, onSubmit, value } = props;

  const activeConnection = useContext(ActiveConnectionContext)?.activeConnection;

  const query = useContext(QueryContext);

  const { getSchemaDefinitionsInstruction } = useSchemaDefinitions();

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

  const getAdditionalSystemInstructions = useCallback(
    async () =>
      [
        activeConnection
          ? `The engine is ${activeConnection.engine}. When generating SQL, use quotes as necessary, particularly to ensure correct casing.`
          : null,
        await getSchemaDefinitionsInstruction(),
      ]
        .filter(isNotNull)
        .join('\n\n') || null,
    [activeConnection, getSchemaDefinitionsInstruction],
  );

  return (
    <form className="flex flex-col gap-3" onSubmit={submitQuery}>
      <div className="max-h-[200px] w-full overflow-auto overflow-x-hidden rounded-lg border border-border bg-background pr-2">
        <CodeEditor
          autoFocus
          getAdditionalSystemInstructions={getAdditionalSystemInstructions}
          language={activeConnection?.engine ?? 'sql'}
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
            disabled: !value?.trim() || query?.query.isLoading || isSubmitDisabled,
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
