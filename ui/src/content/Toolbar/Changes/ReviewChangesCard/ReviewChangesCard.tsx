import React from 'react';
import { ConnectionsContext } from '~/content/connections/Context';
import { EditContext } from '~/content/edit/Context';
import { QueriesContext } from '~/content/queries/Context';
import { trpc } from '~/trpc';
import { Editor } from '~/shared/components/Editor/Editor';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';

export type ReviewChangesCardProps = {
  triggerRef: React.RefObject<HTMLButtonElement>;
};

export const ReviewChangesCard: React.FC<ReviewChangesCardProps> = (props) => {
  const { triggerRef } = props;

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { queries, runQuery } = useDefinedContext(QueriesContext);
  const { clearChanges, sql } = useDefinedContext(EditContext);

  return (
    <OverlayCard align="right" triggerRef={triggerRef}>
      {() => (
        <div className="p-4">
          <Editor
            initialValue={sql}
            onSubmit={async (sql) => {
              if (!activeConnection) return;

              await trpc.sendQuery.query([activeConnection.clientId, sql]);

              clearChanges();

              queries.flat().forEach((query) => {
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
