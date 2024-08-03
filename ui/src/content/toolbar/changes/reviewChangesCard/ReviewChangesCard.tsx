import React, { useCallback, useEffect, useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { EditContext } from '~/content/edit/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { TrpcContext } from '~/content/trpc/Context';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { SqlEditor } from '~/shared/components/sqlEditor/SqlEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { parseStatements } from '~/shared/utils/sql';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const { triggerRef } = props;

  const trpc = useDefinedContext(TrpcContext);

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
  }, [activeConnection, clearChanges, refetchActiveTabSelectQueries, trpc, userSql]);

  return (
    <OverlayCard align="right" htmlProps={{ className: 'p-3' }} triggerRef={triggerRef}>
      {() => (
        <div className="w-[592px]">
          <SqlEditor onChange={(sql) => setUserSql(sql)} onSubmit={handleSubmit} value={userSql} />
        </div>
      )}
    </OverlayCard>
  );
};
