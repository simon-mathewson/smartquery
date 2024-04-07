import React, { useCallback, useEffect, useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { EditContext } from '~/content/edit/Context';
import { QueriesContext } from '~/content/tabs/Queries/Context';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { SqlEditor } from '~/shared/components/SqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { parseStatements } from '~/shared/utils/sql';
import { trpc } from '~/trpc';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const { triggerRef } = props;

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { refetchActiveTabSelectQueries } = useDefinedContext(QueriesContext);
  const { clearChanges, sql } = useDefinedContext(EditContext);

  const [userSql, setUserSql] = useState(sql);

  useEffect(() => {
    setUserSql(sql);
  }, [sql]);

  const handleSubmit = useCallback(async () => {
    if (!activeConnection) return;

    await trpc.sendQuery.mutate({
      clientId: activeConnection.clientId,
      statements: parseStatements(userSql),
    });

    clearChanges();

    refetchActiveTabSelectQueries();
  }, [activeConnection, clearChanges, refetchActiveTabSelectQueries, userSql]);

  return (
    <OverlayCard align="right" triggerRef={triggerRef}>
      {() => (
        <div className="w-[592px] p-4">
          <SqlEditor onChange={(sql) => setUserSql(sql)} onSubmit={handleSubmit} value={userSql} />
        </div>
      )}
    </OverlayCard>
  );
};
