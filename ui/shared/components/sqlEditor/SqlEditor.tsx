import { Send, Undo } from '@mui/icons-material';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { CodeEditor } from '../codeEditor/CodeEditor';
import { QueryContext } from '~/content/tabs/queries/query/Context';
import { useSchemaDefinitions } from '~/content/ai/schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { useDebouncedCallback } from 'use-debounce';

export type SqlEditorProps = {
  bottomToolbarActions?: (props: {
    htmlProps: React.HTMLAttributes<HTMLElement>;
    value: string;
  }) => React.ReactNode;
  isResetDisabled?: boolean;
  isSubmitDisabled?: boolean;
  onChange?: (sql: string) => void;
  onKeyDown?: () => void;
  onReset?: () => void;
  onSubmit?: () => Promise<void>;
  value: string;
};

export const SqlEditor: React.FC<SqlEditorProps> = (props) => {
  const {
    bottomToolbarActions,
    isResetDisabled,
    isSubmitDisabled,
    onChange,
    onKeyDown,
    onReset,
    onSubmit,
    value,
  } = props;

  const activeConnection = useContext(ActiveConnectionContext)?.activeConnection;

  const query = useContext(QueryContext);

  const { getAndRefreshSchemaDefinitions } = useSchemaDefinitions();

  const submitQuery = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      await onSubmit?.();

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    [onSubmit],
  );

  const initialHeight = 136;
  const getMaxHeight = () => Math.min(window.innerHeight * 0.5, 480);
  const [maxHeight, setMaxHeight] = useState(getMaxHeight);

  const handleResize = useDebouncedCallback(() => {
    setMaxHeight(getMaxHeight());
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const sqlEditorRef = useRef<HTMLFormElement | null>(null);

  return (
    <form className="flex flex-col gap-3" onSubmit={submitQuery} ref={sqlEditorRef}>
      <div className="max-h-content border-controlBorder w-full overflow-hidden rounded-2xl border bg-background transition-all ease-in-out">
        <CodeEditor
          bottomToolbar={
            <div className="flex justify-end gap-3 px-2.5 py-3">
              {bottomToolbarActions?.({
                htmlProps: { className: 'pointer-events-auto flex-shrink-0' },
                value,
              })}
              <Button
                color="secondary"
                htmlProps={{
                  className: 'pointer-events-auto flex-shrink-0',
                  disabled: isResetDisabled,
                  onClick: () => {
                    onReset?.();
                  },
                }}
                icon={<Undo />}
                tooltip="Reset"
              />
              <Button
                htmlProps={{
                  className: 'w-36 pointer-events-auto flex-shrink-0',
                  disabled: !value?.trim() || query?.query.isLoading || isSubmitDisabled,
                  type: 'submit',
                }}
                icon={<Send />}
                label="Submit"
                variant="filled"
              />
            </div>
          }
          getSchemaDefinitions={getAndRefreshSchemaDefinitions}
          language={activeConnection?.engine ?? 'sql'}
          large
          height={initialHeight}
          maxHeight={maxHeight}
          onChange={onChange}
          onKeyDown={onKeyDown}
          submit={submitQuery}
          value={value}
        />
      </div>
    </form>
  );
};
