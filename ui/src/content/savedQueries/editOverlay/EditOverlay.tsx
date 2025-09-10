import { BookmarkBorderOutlined, BookmarkOutlined, DeleteOutline, Done } from '@mui/icons-material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import {
  QueryContext,
  ResultContext,
  SavedQueryContext,
} from '~/content/tabs/queries/query/Context';
import { getQueryTitle } from '~/content/tabs/queries/query/utils';
import { Button } from '~/shared/components/button/Button';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { SavedQueriesContext } from '../Context';

export const SavedQueryEditOverlay: React.FC = () => {
  const { deleteSavedQuery, createSavedQuery, updateSavedQuery } =
    useDefinedContext(SavedQueriesContext);
  const { query } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);
  const savedQuery = useContext(SavedQueryContext);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const overlay = useOverlay({
    triggerRef,
  });

  const title = savedQuery ? 'Saved query' : 'Save Query';

  const [name, setName] = useState(getQueryTitle(query, result, savedQuery));

  useEffect(() => {
    if (savedQuery) {
      setName(savedQuery.name);
    }
  }, [savedQuery]);

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>, close: () => void) => {
      event.preventDefault();

      assert(query.sql);

      setIsSaving(true);

      if (savedQuery) {
        await updateSavedQuery(savedQuery.id, { name }, query.id, close);
      } else {
        await createSavedQuery({ name, sql: query.sql }, query.id, close);
      }

      setIsSaving(false);
    },
    [createSavedQuery, name, query.sql, query.id, savedQuery, updateSavedQuery],
  );

  return (
    <>
      <OverlayCard htmlProps={{ className: 'w-[250px]' }} overlay={overlay}>
        {({ close }) => (
          <>
            <Header
              middle={
                <div className="text-center text-sm font-medium text-textPrimary">{title}</div>
              }
              right={
                savedQuery && (
                  <ConfirmDeletePopover
                    onConfirm={() => deleteSavedQuery(savedQuery, query.id, close)}
                    renderTrigger={(buttonProps) => (
                      <Button
                        color="danger"
                        htmlProps={buttonProps}
                        icon={<DeleteOutline />}
                        tooltip="Delete saved query"
                      />
                    )}
                    text="Delete saved query"
                  />
                )
              }
            />
            <form className="space-y-2" onSubmit={(event) => onSubmit(event, close)}>
              <Field label="Name">
                <Input
                  htmlProps={{ autoFocus: true, disabled: isSaving, value: name }}
                  onChange={setName}
                />
              </Field>
              <Button
                icon={<Done />}
                htmlProps={{
                  className: 'w-full',
                  disabled: isSaving || savedQuery?.name === name,
                  type: 'submit',
                }}
                label="Save"
                variant="filled"
              />
            </form>
          </>
        )}
      </OverlayCard>
      <Button
        icon={savedQuery ? <BookmarkOutlined /> : <BookmarkBorderOutlined />}
        htmlProps={{ disabled: !query.sql, ref: triggerRef }}
        tooltip={title}
      />
    </>
  );
};
