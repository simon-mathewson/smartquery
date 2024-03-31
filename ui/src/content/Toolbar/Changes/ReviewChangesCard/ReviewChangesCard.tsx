import React, { useCallback, useEffect, useState } from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { EditContext } from '~/content/edit/Context';
import { trpc } from '~/trpc';
import { SqlEditor } from '~/shared/components/SqlEditor/SqlEditor';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '~/content/tabs/Context';
import { parseStatements } from '~/shared/utils/sql';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const { triggerRef } = props;

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { tabs, runQuery } = useDefinedContext(TabsContext);
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

    tabs
      .map((tab) => tab.queries)
      .flat(2)
      .forEach((query) => {
        if (query.sql) {
          runQuery(query.id);
        }
      });
  }, [activeConnection, clearChanges, runQuery, tabs, userSql]);

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
