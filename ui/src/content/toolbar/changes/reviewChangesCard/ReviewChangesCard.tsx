import React, { useCallback, useEffect, useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { EditContext } from '~/content/edit/Context';
import { SqliteContext } from '~/content/sqlite/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { LinkApiContext } from '~/content/link/api/Context';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { splitSqlStatements } from '~/shared/utils/sql/sql';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { ToastContext } from '~/content/toast/Context';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const toast = useDefinedContext(ToastContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { triggerRef } = props;

  const linkApi = useDefinedContext(LinkApiContext);
  const { getSqliteContent, requestFileHandlePermission, storeSqliteContent } =
    useDefinedContext(SqliteContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { refetchActiveTabSelectQueries } = useDefinedContext(QueriesContext);
  const { clearChanges, sql } = useDefinedContext(EditContext);

  const [userSql, setUserSql] = useState(sql);

  useEffect(() => {
    setUserSql(sql);
  }, [sql]);

  const handleSubmit = useCallback(async () => {
    if (!activeConnection) return;

    track('toolbar_changes_submit');

    if (activeConnection.engine === 'sqlite') {
      const fileHandle = await getSqliteContent(activeConnection.id);

      if (fileHandle instanceof FileSystemFileHandle) {
        await requestFileHandlePermission(fileHandle);
      }

      activeConnection.sqliteDb.run(splitSqlStatements(userSql).join(';'));

      const updatedDb = activeConnection.sqliteDb.export();

      if (fileHandle instanceof FileSystemFileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(updatedDb);
        await writable.close();
      } else {
        await storeSqliteContent(updatedDb, activeConnection.id);
      }
    } else {
      await linkApi.sendQuery.mutate({
        clientId: activeConnection.clientId,
        statements: splitSqlStatements(userSql),
      });
    }

    toast.add({
      color: 'success',
      title: 'Changes saved',
    });

    clearChanges();

    refetchActiveTabSelectQueries();
  }, [
    activeConnection,
    clearChanges,
    getSqliteContent,
    linkApi.sendQuery,
    refetchActiveTabSelectQueries,
    requestFileHandlePermission,
    storeSqliteContent,
    toast,
    track,
    userSql,
  ]);

  const overlay = useOverlay({
    align: 'right',
    triggerRef,
  });

  return (
    <OverlayCard htmlProps={{ className: 'p-3' }} overlay={overlay}>
      {() => (
        <div className="w-[592px]">
          <SqlEditor onChange={(sql) => setUserSql(sql)} onSubmit={handleSubmit} value={userSql} />
        </div>
      )}
    </OverlayCard>
  );
};
