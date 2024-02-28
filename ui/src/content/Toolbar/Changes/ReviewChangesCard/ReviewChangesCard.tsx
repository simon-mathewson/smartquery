import React from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { EditContext } from '~/content/edit/Context';
import { trpc } from '~/trpc';
import { SqlEditor } from '~/shared/components/SqlEditor/SqlEditor';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '~/content/tabs/Context';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const { triggerRef } = props;

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { tabs, runQuery } = useDefinedContext(TabsContext);
  const { clearChanges, sql } = useDefinedContext(EditContext);

  return (
    <OverlayCard align="right" triggerRef={triggerRef}>
      {() => (
        <div className="p-4">
          <SqlEditor
            initialValue={sql}
            onSubmit={async (sql) => {
              if (!activeConnection) return;

              await trpc.sendQuery.query([activeConnection.clientId, sql]);

              clearChanges();

              tabs
                .map((tab) => tab.queries)
                .flat(2)
                .forEach((query) => {
                  if (query.sql) {
                    runQuery(query);
                  }
                });
            }}
          />
        </div>
      )}
    </OverlayCard>
  );
};
