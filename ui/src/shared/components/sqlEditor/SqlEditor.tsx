import { Send } from '@mui/icons-material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { CodeEditor } from '../codeEditor/CodeEditor';
import { QueryContext } from '~/content/tabs/queries/query/Context';
import { useSchemaDefinitions } from '~/content/ai/schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { isNotNull } from '~/shared/utils/typescript/typescript';
import classNames from 'classnames';
import { useEscape } from '~/shared/hooks/useEscape/useEscape';
import { useDebouncedCallback } from 'use-debounce';

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

  const [isExtended, setIsExtended] = useState(false);

  useEscape({
    active: isExtended,
    handler: () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
  });

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

  const initialHeight = 136;
  const [extendedHeight, setExtendedHeight] = useState(Math.min(window.innerHeight * 0.5, 480));
  const height = isExtended ? extendedHeight : initialHeight;

  const handleResize = useDebouncedCallback(() => {
    setExtendedHeight(Math.min(window.innerHeight * 0.4, 480));
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <form className="relative flex flex-col gap-3" onSubmit={submitQuery}>
      <div className="transition-all ease-in-out" style={{ height: initialHeight }} />
      <div
        className={classNames(
          'max-h-content absolute inset-0 z-40 w-full overflow-hidden rounded-lg border border-border bg-background transition-all ease-in-out',
          {
            'shadow-xl': isExtended,
          },
        )}
        style={{ height }}
      >
        <CodeEditor
          bottomToolbar={
            <div className="flex items-end justify-between px-2.5 py-3">
              <Button
                htmlProps={{
                  className: 'ml-auto w-36 pointer-events-auto flex-shrink-0',
                  disabled: !value?.trim() || query?.query.isLoading || isSubmitDisabled,

                  // When clicking the button while the editor collpases, mouse up will be outside of
                  // button and not trigger click.
                  onMouseDown: submitQuery,

                  type: 'submit',
                }}
                icon={<Send />}
                label="Submit"
                variant="filled"
              />
            </div>
          }
          getAdditionalSystemInstructions={getAdditionalSystemInstructions}
          language={activeConnection?.engine ?? 'sql'}
          large
          height={height}
          maxHeight={height}
          onChange={onChange}
          onFocus={() => setIsExtended(true)}
          onBlur={() => setIsExtended(false)}
          submit={submitQuery}
          value={value}
        />
      </div>
    </form>
  );
};
