import React, { useCallback, useEffect, useState } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { EditContext } from '~/content/edit/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { ToastContext } from '~/content/toast/Context';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { splitSqlStatements } from '~/shared/utils/sql/sql';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const toast = useDefinedContext(ToastContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { triggerRef } = props;

  const { runQuery } = useDefinedContext(ActiveConnectionContext);
  const { refetchActiveTabSelectQueries } = useDefinedContext(QueriesContext);
  const { clearChanges, sql } = useDefinedContext(EditContext);

  const [userSql, setUserSql] = useState(sql);

  useEffect(() => {
    setUserSql(sql);
  }, [sql]);

  const handleSubmit = useCallback(async () => {
    track('toolbar_changes_submit');

    await runQuery(splitSqlStatements(userSql));

    toast.add({
      color: 'success',
      title: 'Changes saved',
    });

    clearChanges();

    refetchActiveTabSelectQueries();
  }, [clearChanges, refetchActiveTabSelectQueries, runQuery, toast, track, userSql]);

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
