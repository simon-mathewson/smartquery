import React, { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TableList } from '../TableList/TableList';
import { Connections } from './Connections/Connections';
import { ConnectionsContext } from '../connections/Context';

export const NavigationSidebar: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const connectionsTriggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="sticky top-0 flex h-screen grid-rows-[max-content_max-content_minmax(auto,max-content)] flex-col gap-2 px-2 pt-2">
      <div
        className="hover:bg-secondaryHighlight grid w-full cursor-pointer gap-1 rounded-lg p-2 text-sm"
        ref={connectionsTriggerRef}
      >
        {activeConnection ? (
          <>
            <div className="text-md text-textPrimary truncate font-medium leading-tight">
              {activeConnection.name}
            </div>
            <div className="text-textSecondary truncate text-xs leading-tight">
              {activeConnection.user}@{activeConnection.host}:{activeConnection.port}
            </div>
            <div className="text-textSecondary truncate font-mono text-xs font-medium leading-tight">
              {activeConnection.database}
            </div>
          </>
        ) : (
          <div>Select connection</div>
        )}
      </div>
      <Connections triggerRef={connectionsTriggerRef} />
      {activeConnection && <TableList />}
    </div>
  );
};
