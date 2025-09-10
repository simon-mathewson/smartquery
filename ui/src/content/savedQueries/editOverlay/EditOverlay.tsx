import { BookmarkBorderOutlined, BookmarkOutlined, DeleteOutline, Done } from '@mui/icons-material';
import { useCallback, useContext, useRef, useState } from 'react';
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
import { CloudApiContext } from '~/content/cloud/api/Context';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { assert } from 'ts-essentials';
import { ToastContext } from '~/content/toast/Context';
import { SavedQueriesContext } from '../Context';
import { QueriesContext } from '~/content/tabs/queries/Context';

export const SavedQueryEditOverlay: React.FC = () => {
  const toast = useDefinedContext(ToastContext);
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);
  const { updateQuery } = useDefinedContext(QueriesContext);
  const { refetchSavedQueries } = useDefinedContext(SavedQueriesContext);
  const { query } = useDefinedContext(QueryContext);
  const result = useContext(ResultContext);
  const savedQuery = useContext(SavedQueryContext);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const overlay = useOverlay({
    triggerRef,
  });

  const title = savedQuery ? 'Saved query' : 'Save Query';

  const [name, setName] = useState(savedQuery?.name ?? getQueryTitle(query, result, savedQuery));

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>, close: () => void) => {
      event.preventDefault();

      assert(query.sql);

      setIsSaving(true);

      try {
        if (savedQuery) {
          await cloudApi.savedQueries.update.mutate({ id: savedQuery.id, name });

          await updateQuery({ id: query.id, savedQueryId: savedQuery.id });
        } else {
          const id = await cloudApi.savedQueries.create.mutate({
            connectionId: activeConnection.id,
            database: activeConnection.engine === 'postgres' ? activeConnection.database : null,
            name,
            sql: query.sql,
          });

          await updateQuery({ id: query.id, savedQueryId: id });
        }

        await refetchSavedQueries();
      } catch (error) {
        console.error(error);
        toast.add({
          color: 'danger',
          title: 'Failed to save query',
        });
      } finally {
        setIsSaving(false);
      }

      void close();
    },
    [
      activeConnection.database,
      activeConnection.engine,
      activeConnection.id,
      cloudApi,
      name,
      query.id,
      query.sql,
      refetchSavedQueries,
      savedQuery,
      toast,
      updateQuery,
    ],
  );

  const onDelete = useCallback(
    async (close: () => void) => {
      assert(savedQuery);

      await cloudApi.savedQueries.delete.mutate(savedQuery.id);
      await updateQuery({ id: query.id, savedQueryId: null });
      await refetchSavedQueries();
      void close();
    },
    [cloudApi, query.id, refetchSavedQueries, savedQuery, updateQuery],
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
                    onConfirm={() => onDelete(close)}
                    renderTrigger={(buttonProps) => (
                      <Button color="danger" htmlProps={buttonProps} icon={<DeleteOutline />} />
                    )}
                    text="Delete saved query"
                  />
                )
              }
            />
            <form className="space-y-2" onSubmit={(event) => onSubmit(event, close)}>
              <Field label="Name">
                <Input htmlProps={{ disabled: isSaving, value: name }} onChange={setName} />
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
